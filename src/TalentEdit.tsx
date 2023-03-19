import { UseFormRegister, UseFormWatch } from 'react-hook-form';

import { type TalentFormT } from './App';
import IconPicker from './form/IconPicker';
import Input from './form/Input';
import Textarea from './form/Textarea';

type Props = {
	selected: number;
	watch: UseFormWatch<TalentFormT>;
	register: UseFormRegister<TalentFormT>;
};

const TalentEdit = ({ watch, register, selected }: Props) => (
	<div className="flex flex-col gap-4">
		<Input {...register(`tree.${selected}.name`)} label="Name" />
		<div className="flex gap-4 items-end">
			<Input
				{...register(`tree.${selected}.ranks`, { valueAsNumber: true })}
				label="Ranks"
				type="number"
				className="flex-grow"
			/>
			<IconPicker
				icon={watch(`tree.${selected}.icon`)}
				inputProps={register(`tree.${selected}.icon`)}
			/>
		</div>
		<Textarea {...register(`tree.${selected}.description`)} label="Text" />
		<Input
			{...register(`tree.${selected}.requires`, { valueAsNumber: true })}
			label="Requires"
			type="number"
		/>
	</div>
);

export default TalentEdit;
