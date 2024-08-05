'use client';

import { ExternalLink, NotebookPen, Workflow, X } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';

import { type BuildFormT, type TalentFormT } from '~/server/api/types';
import { isEmptyTalent } from '~/utils';

import TextButton from '../styled/TextButton';
import SpellIcon from '../styled/SpellIcon';
import DialogButton from '../styled/DialogButton';

import TalentPreview from './TalentPreview';
import TreePickDialog from './TreePickDialog';

type Props = {
	idx: 0 | 1 | 2;
	value?: TalentFormT;
};

const PointsSpent = ({ idx, value }: Props) => {
	const points = useWatch<BuildFormT, `points.${0 | 1 | 2}`>({
		name: `points.${idx}`
	});
	return (
		<span className="h4 shrink-0 text-blueGray">
			{points.reduce((acc, curr) => acc + curr, 0)} /{' '}
			{value?.talents.reduce((acc, curr) => acc + (curr?.ranks ?? 0), 0)}
		</span>
	);
};

const TalentSpec = ({ idx, value }: Props) => {
	const { setValue } = useFormContext<BuildFormT>();

	if (!value)
		return (
			<div className="flex min-h-[50vh] flex-col items-center justify-center p-8">
				<TreePickDialog idx={idx}>
					{open => (
						<TextButton onClick={open}>
							<p className="h1 text-inherit">+</p>
							<p className="h4 text-inherit">Pick a tree</p>
						</TextButton>
					)}
				</TreePickDialog>
			</div>
		);

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-2 px-4">
				<SpellIcon icon={value.icon} className="size-8" />
				<span className="h4 grow truncate" title={value.name}>
					{value.name}
				</span>
				<TextButton
					icon={ExternalLink}
					title="Open tree"
					type="link"
					href={`/tree/${value.id}`}
					className="-m-2 shrink-0"
				/>
				<PointsSpent idx={idx} value={value} />
			</div>

			<hr className="!-mx-1" />

			<div className="-my-3 grid flex-shrink-0 grow select-none grid-cols-[repeat(4,_max-content)] content-center justify-center gap-6 overflow-x-auto pb-3 pt-6">
				{value.talents.map((field, i) =>
					isEmptyTalent(field) ? (
						<div key={i} />
					) : (
						<TalentPreview
							key={i}
							{...field}
							i={i}
							idx={idx}
							talents={value.talents}
						/>
					)
				)}
			</div>

			<div className="flex flex-wrap justify-center gap-x-2">
				<TreePickDialog idx={idx}>
					{open => (
						<TextButton
							onClick={open}
							icon={Workflow}
							iconSize={14}
							className="text-sm text-blueGray"
						>
							Change tree
						</TextButton>
					)}
				</TreePickDialog>
				{value.notes && (
					<DialogButton
						dialog={
							<div className="tw-surface flex max-w-screen-sm flex-col gap-2 overflow-auto bg-darkGray/90">
								<h3 className="tw-color">{value.name} notes</h3>
								<p className="max-h-[80vh] overflow-y-auto whitespace-pre-wrap">
									{value.notes}
								</p>
							</div>
						}
						clickAway
					>
						{open => (
							<TextButton
								icon={NotebookPen}
								onClick={open}
								iconSize={14}
								className="text-sm text-blueGray"
							>
								Notes
							</TextButton>
						)}
					</DialogButton>
				)}
				<TextButton
					onClick={() =>
						setValue(
							`points.${idx}`,
							[...Array(4 * 7).keys()].map(() => 0)
						)
					}
					icon={X}
					iconSize={14}
					className="text-sm text-red"
				>
					Clear points
				</TextButton>
			</div>
		</div>
	);
};

export default TalentSpec;
