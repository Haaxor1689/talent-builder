import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { UseFormRegister, UseFormWatch } from 'react-hook-form';

import { type TalentFormT } from './types';
import IconButton from './components/IconButton';
import ConfirmDialog from './ConfirmDialog';
import IconPicker from './form/IconPicker';
import Input from './form/Input';
import Textarea from './form/Textarea';

type Props = {
	selected: number;
	watch: UseFormWatch<TalentFormT>;
	register: UseFormRegister<TalentFormT>;
	onDelete: () => void;
};

const TalentEdit = ({ selected, watch, register, onDelete }: Props) => (
	<div className="flex flex-col gap-4 w-full md:max-w-md">
		<div className="flex gap-2 items-center">
			<IconPicker
				icon={watch(`tree.${selected}.icon`)}
				inputProps={register(`tree.${selected}.icon`)}
			/>
			<Input
				{...register(`tree.${selected}.name`)}
				className="flex-grow text-lg"
			/>
			<ConfirmDialog
				title={`Are you sure you want to delete "${watch('name')}"?`}
				confirm={onDelete}
			>
				{open => (
					<IconButton
						onClick={open}
						className="text-red-500"
						icon={faTrash}
						title="Delete"
					/>
				)}
			</ConfirmDialog>
		</div>
		<Input
			{...register(`tree.${selected}.ranks`, { valueAsNumber: true })}
			label="Ranks"
			type="number"
		/>
		<Textarea {...register(`tree.${selected}.description`)} label="Text" />
		<Input
			{...register(`tree.${selected}.requires`, { valueAsNumber: true })}
			label="Requires"
			type="number"
		/>
	</div>
);

export default TalentEdit;
