import { Fragment } from 'react';

import { type TalentFormT } from '~/server/api/types';

export const formatTalentDescription = (
	field: TalentFormT['talents'][number],
	value?: number
) => {
	if (!field.description) return null;
	if (!field.ranks || field.ranks <= 1) return field.description;

	const reg = new RegExp(
		`([\\d\\.]*(?:\\/[\\d\\.]*\\d){${field.ranks - 1}})`,
		'gm'
	);
	const result: (string | JSX.Element)[] = [];

	const arr = [...field.description.matchAll(reg)];

	arr.map((match, i) => {
		if (i === 0) result.push(field.description.slice(0, match.index));

		const ranks = match[0].split('/');
		if (ranks.length !== field.ranks) {
			result.push(match[0]);
		} else {
			result.push(
				<span key={i} className="text-blueGray">
					[
					{value === undefined
						? ranks.join('/')
						: ranks.map((r, i) => (
								<Fragment key={i}>
									{i === value - 1 ? (
										<span className="font-extrabold text-white">{r}</span>
									) : (
										r
									)}
									{i === ranks.length - 1 ? '' : '/'}
								</Fragment>
						  ))}
					]
				</span>
			);
		}

		if (i < arr.length - 1) {
			if (!arr[i + 1]?.index) throw new Error('Unexpected end of match');
			result.push(
				field.description.slice(
					match.index + match[0].length,
					arr[i + 1]?.index
				)
			);
		} else {
			result.push(field.description.slice(match.index + match[0].length));
		}
	});

	if (result.length === 0) return field.description;

	return result;
};
