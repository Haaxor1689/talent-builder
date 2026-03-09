import { useMemo, useRef } from 'react';
import { useWatch } from 'react-hook-form';
import { Camera } from 'lucide-react';

import { formatTalentDescription } from '#components/calculator/formatTalentDescription.tsx';
import Dialog, { closeDialog } from '#components/styled/Dialog.tsx';
import SpellIcon from '#components/styled/SpellIcon.tsx';
import TextButton from '#components/styled/TextButton.tsx';
import { elementToPng } from '#utils/index.ts';

const TalentScreenshot = ({ selected }: { selected: number }) => {
	const ref = useRef<HTMLDivElement>(null);

	const item = useWatch({ name: `talents.${selected}` });

	const description = useMemo(
		() => formatTalentDescription(item),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[item.description, item.ranks]
	);

	return (
		<div className="flex justify-end">
			<Dialog
				unstyled
				trigger={open => (
					<TextButton icon={<Camera />} title="Screenshot" onClick={open} />
				)}
			>
				<div className="flex flex-col items-center gap-4">
					<TextButton
						icon={<Camera />}
						onClick={async e => {
							if (!ref.current) return;
							await elementToPng(ref.current, item.name);
							closeDialog(e);
						}}
					>
						Save screenshot
					</TextButton>
					<div ref={ref} className="flex items-start gap-2">
						<SpellIcon icon={item.icon} showDefault />
						<div className="haax-surface-3 pointer-events-none z-10 max-w-100 min-w-62.5">
							<h4 className="haax-color">{item.name ?? '[Empty talent]'}</h4>
							<p className="whitespace-pre-wrap">
								{description ?? '[No description]'}
							</p>
						</div>
					</div>
				</div>
			</Dialog>
		</div>
	);
};

export default TalentScreenshot;
