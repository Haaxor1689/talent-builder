import cls from 'classnames';
import { type JSX, useMemo } from 'react';

import { type Talent } from '#server/schemas.ts';

type Props = {
	field?: Talent;
	value?: number;
};

export const TalentDescription = ({ field, value }: Props) => {
	// eslint-disable-next-line react-hooks/preserve-manual-memoization
	const description = useMemo(() => {
		if (!field?.description) return null;
		if (!field.ranks || field.ranks <= 1) return field.description;

		if (field.description.includes('\n\nNext rank:\n')) {
			if (value === undefined) return field.description;
			const ranks = field.description.split('\n\nNext rank:\n');
			return (
				<>
					{value !== 0 && ranks[value - 1]}
					{ranks[value] && (
						<>
							<span className="font-bold">
								{value !== 0 && `\n\nNext rank:\n`}
							</span>
							<span className="text-blue-gray">{ranks[value]}</span>
						</>
					)}
				</>
			);
		}

		const reg = new RegExp(
			`([\\d\\.]*(?:\\/[\\d\\.]*\\d){${field.ranks - 1}})`,
			'gm'
		);

		const desc = field.description;
		const matches = [...desc.matchAll(reg)];
		return matches.reduce(
			(prev, match, i) => {
				const next = desc.slice(
					match.index + match[0].length,
					matches[i + 1]?.index
				);

				const ranks = match[0].split('/');
				if (ranks.length !== field.ranks) return [...prev, match[0], next];

				return [
					...prev,
					<span key={i} className="text-blue-gray">
						[
						{ranks.flatMap((r, i) => [
							i + 1 === value ? (
								<span key={i} className="font-extrabold text-white">
									{r}
								</span>
							) : (
								r
							),
							i === ranks.length - 1 ? '' : '/'
						])}
						]
					</span>,
					next
				];
			},
			[desc.slice(0, matches[0]?.index)] as (string | JSX.Element)[]
		);
	}, [field?.description, field?.ranks, value]);

	return (
		<p className={cls('whitespace-pre-wrap', !description && 'text-blue-gray')}>
			{description ?? '[No description]'}
		</p>
	);
};
