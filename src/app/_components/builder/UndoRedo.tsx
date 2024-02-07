import { cloneDeep, isEqual } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { type TalentFormT } from '~/server/api/types';

import TextButton from '../styled/TextButton';

const UndoRedo = ({ defaultValues }: { defaultValues: TalentFormT }) => {
	const [disabled, setDisabled] = useState([true, true]);

	const { watch, reset } = useFormContext<TalentFormT>();
	const history = useRef<TalentFormT[]>([defaultValues]);
	const index = useRef(0);
	const isReset = useRef(false);

	const updateDisabled = () => {
		setDisabled([
			index.current === history.current.length - 1,
			index.current === 0
		]);
	};

	const undo = () => {
		if (index.current === history.current.length - 1) return;
		index.current += 1;
		isReset.current = true;

		reset(history.current[index.current], {
			keepDefaultValues: true
		});

		updateDisabled();
	};

	const redo = () => {
		if (index.current === 0) return;
		index.current -= 1;
		isReset.current = true;
		reset(history.current[index.current], {
			keepDefaultValues: true
		});

		updateDisabled();
	};

	useEffect(() => {
		const { unsubscribe } = watch(v => {
			if (isReset.current) {
				isReset.current = false;
				return;
			}

			if (isEqual(v, history.current[index.current])) return;

			history.current = [
				cloneDeep(v) as never,
				...history.current.slice(index.current)
			];

			index.current = 0;
			updateDisabled();
		});
		return () => unsubscribe();
	}, [watch]);

	useEffect(() => {
		const callback = (e: KeyboardEvent): void => {
			if (e.key?.toLocaleLowerCase() !== 'z' || !e.ctrlKey) return;
			e.preventDefault();

			if (!e.shiftKey) {
				undo();
			} else {
				redo();
			}
		};
		window.addEventListener('keydown', callback);
		return () => window.removeEventListener('keydown', callback);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [reset]);

	return (
		<div className="absolute left-0 top-0 flex gap-1">
			<TextButton
				onClick={undo}
				icon={ArrowLeft}
				title="Undo"
				disabled={disabled[0]}
				className="-m-2"
			/>
			<TextButton
				onClick={redo}
				icon={ArrowRight}
				title="Redo"
				disabled={disabled[1]}
				className="-m-2"
			/>
		</div>
	);
};

export default UndoRedo;
