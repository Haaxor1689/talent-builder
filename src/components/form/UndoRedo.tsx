import { cloneDeep, isEqual } from 'es-toolkit';
import { Redo2, Undo2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { type FieldValues, useFormContext } from 'react-hook-form';

import TextButton from '../styled/TextButton';

const UndoRedo = <T extends FieldValues>({
	defaultValues
}: {
	defaultValues: T;
}) => {
	const [disabled, setDisabled] = useState([true, true]);

	const { watch, reset } = useFormContext<T>();
	const historyRef = useRef<T[]>([defaultValues]);
	const indexRef = useRef(0);
	const isResetRef = useRef(false);

	const updateDisabled = () => {
		setDisabled([
			indexRef.current === historyRef.current.length - 1,
			indexRef.current === 0
		]);
	};

	const undo = () => {
		if (indexRef.current === historyRef.current.length - 1) return;
		indexRef.current += 1;
		isResetRef.current = true;

		reset(historyRef.current[indexRef.current], {
			keepDefaultValues: true
		});

		updateDisabled();
	};

	const redo = () => {
		if (indexRef.current === 0) return;
		indexRef.current -= 1;
		isResetRef.current = true;
		reset(historyRef.current[indexRef.current], {
			keepDefaultValues: true
		});

		updateDisabled();
	};

	useEffect(() => {
		const { unsubscribe } = watch(v => {
			if (isResetRef.current) {
				isResetRef.current = false;
				return;
			}

			if (isEqual(v, historyRef.current[indexRef.current])) return;

			historyRef.current = [
				cloneDeep(v) as never,
				...historyRef.current.slice(indexRef.current)
			];

			indexRef.current = 0;
			updateDisabled();
		});
		return () => unsubscribe();
	}, [watch]);

	useEffect(() => {
		const callback = (e: KeyboardEvent): void => {
			if (e.key?.toLocaleLowerCase() !== 'z' || !e.ctrlKey) return;
			e.preventDefault();

			if (!e.shiftKey) undo();
			else redo();
		};
		window.addEventListener('keydown', callback);
		return () => window.removeEventListener('keydown', callback);
		// oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
	}, [reset]);

	return (
		<div className="absolute top-3 left-3 flex gap-1">
			<TextButton
				onClick={undo}
				icon={<Undo2 />}
				title="Undo"
				disabled={disabled[0]}
				className="-m-2"
			/>
			<TextButton
				onClick={redo}
				icon={<Redo2 />}
				title="Redo"
				disabled={disabled[1]}
				className="-m-2"
			/>
		</div>
	);
};

export default UndoRedo;
