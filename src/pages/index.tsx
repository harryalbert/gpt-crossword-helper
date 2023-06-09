import Loading from "@/components/LoadingIcon";
import {ChangeEvent, useState} from "react";
import Image from "next/image";

export default function Home() {
	const maxNumLetters = 20;

	const [loading, setLoading] = useState(false);
	const [answer, setAnswer] = useState("");
	const [numLetters, setNumLetters] = useState<number | null>(5);
	const [letters, setLetters] = useState<string[]>(
		[...Array(maxNumLetters)].map(() => "")
	);
	const [selectedButton, setSelectedButton] = useState("Hint");

	const handleSubmit = async (e: any) => {
		e.preventDefault();

		try {
			setLoading(true);

			const response = await fetch("/api/generate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					clue: e.target.elements.clue.value,
					numLetters: e.target.elements.num_letters.value,
					letters: letters.slice(
						0,
						e.target.elements.num_letters.value
					),
					type: selectedButton,
				}),
			});

			const data = await response.json();
			if (response.status !== 200) {
				throw (
					data.error ||
					new Error(`Request failed with status ${response.status}`)
				);
			}

			setLoading(false);
			setAnswer(data?.result?.choices[0]?.message?.content?.trim());
		} catch (error) {
			console.error(error);
		}
	};

	const handleLetterChange = (e: ChangeEvent<HTMLInputElement>) => {
		const index = parseInt(e.target.id.split("_")[1]);
		const newLetters = [];
		for (let i = 0; i < letters.length; i++) {
			if (i === index) {
				const val = e.target.value.toUpperCase();
				if (val.length <= 1) {
					newLetters.push(val);
				} else {
					newLetters.push(val.slice(val.length - 1));
				}
			} else {
				newLetters.push(letters[i]);
			}
		}
		setLetters(newLetters);
	};

	return (
		<div className="max-w-full overflow-auto">
			<div className="flex justify-center">
				<Image src="/logo.png" alt="logo" width={300} height={300} />
			</div>
			<form onSubmit={handleSubmit}>
				<div>
					<div className="flex justify-center">
						{["Hint", "Answer"].map((title, i) => (
							<button
								key={i}
								id={title}
								className={`${
									selectedButton == title
										? "bg-blue-200 border-blue-400"
										: "bg-gray-100 border-gray-400"
								} border  mx-0 mb-0 mt-2 w-24 p-1`}
								onClick={(e) => {
									e.preventDefault();
									const target = e.target as HTMLInputElement;
									setSelectedButton(target.id);
								}}
							>
								{title}
							</button>
						))}
					</div>
					<label className="text-input-title">Crossword Clue</label>
					<input
						type="text"
						id="clue"
						className="text-input text-center"
						required
					/>
					<label className="text-input-title">
						Number of Letters
					</label>
					<input
						type="number"
						id="num_letters"
						className="text-input mb-3"
						max="20"
						value={numLetters ?? ""}
						onChange={(e) => {
							if (!e.target.value) {
								setNumLetters(null);
								return;
							}

							let val = parseInt(e.target.value);
							if (val <= 20) {
								setNumLetters(val);
							}
						}}
						required
					/>
					<div className="flex justify-center flex-wrap">
						{(numLetters ?? 0) > 0 &&
							[...Array(numLetters)].map((_, i) => (
								<div key={i}>
									<text className="absolute px-3 py-4 text-sm">
										{i + 1}
									</text>
									<input
										type="text"
										id={`letter_${i}`}
										value={letters[i] ?? ""}
										className="border-4 border-black outline-none focus:border-blue-600 mt-3 m-1 w-16 h-16 text-center text-lg"
										placeholder='" "'
										onChange={handleLetterChange}
									/>
								</div>
							))}
					</div>

					<div className="flex justify-center">
						<input
							type="submit"
							className="text-lg text-white font-thin bg-blue-700 mt-3 p-0.5 px-1 rounded"
						/>
					</div>
				</div>

				<div className="flex text-center justify-center p-1 pt-5 text-3xl text-blue-700">
					{loading ? Loading() : answer && <p>{answer}</p>}
				</div>
			</form>
		</div>
	);
}
