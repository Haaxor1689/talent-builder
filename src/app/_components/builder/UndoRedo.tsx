import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';

import { type TalentFormT } from '~/server/api/types';

// TODO: Figure this out correctly
const UndoRedo = () => {
	const { watch, reset } = useFormContext<TalentFormT>();
	const history = useRef<TalentFormT[]>([]);
	const index = useRef(0);
	const isReset = useRef(false);

	useEffect(() => {
		const { unsubscribe } = watch(v => {
			console.log('change');
			console.log({
				history: history.current.length,
				index: index.current,
				isReset: isReset.current
			});

			if (isReset.current) {
				isReset.current = false;
				return;
			}

			history.current = [
				v as never,
				...history.current.slice(0, index.current)
			];
			index.current = 0;
		});
		return () => unsubscribe();
	}, [watch]);

	useEffect(() => {
		const callback = (e: KeyboardEvent): void => {
			if (e.ctrlKey && e.key === 'z') {
				e.preventDefault();
				console.log('undo');
				console.log({
					history: history.current.length,
					index: index.current,
					isReset: isReset.current
				});
				if (index.current === history.current.length) return;
				index.current += 1;
				isReset.current = true;
				reset(history.current[index.current]);
			}
			if (e.ctrlKey && e.key === 'y') {
				e.preventDefault();
				console.log('redo');
				console.log({
					history: history.current.length,
					index: index.current,
					isReset: isReset.current
				});
				if (index.current === 0) return;
				index.current -= 1;
				isReset.current = true;
				reset(history.current[index.current]);
			}
		};
		window.addEventListener('keydown', callback);
		return () => window.removeEventListener('keydown', callback);
	}, [reset]);

	return null;
};

export default UndoRedo;
