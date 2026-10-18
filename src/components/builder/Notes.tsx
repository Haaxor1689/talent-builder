import { useController } from 'react-hook-form';

import { type TalentForm } from '#server/schemas.ts';

import NotesEditor from '../styled/NotesEditor';

type Props = {
	editable?: boolean;
};

const Notes = ({ editable }: Props) => {
	const { field } = useController<TalentForm, 'notes'>({ name: 'notes' });

	return (
		<NotesEditor
			value={field.value}
			onChange={field.onChange}
			editable={editable}
			emptyText="*This tree contains no general notes.*"
		/>
	);
};

export default Notes;
