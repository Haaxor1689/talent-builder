import { useController } from 'react-hook-form';

import { type CollectionForm } from '#server/schemas.ts';

import NotesEditor from '../styled/NotesEditor';

type Props = {
	editable?: boolean;
};

const CollectionNotes = ({ editable }: Props) => {
	const { field } = useController<CollectionForm, 'notes'>({ name: 'notes' });

	return (
		<NotesEditor
			value={field.value}
			onChange={field.onChange}
			editable={editable}
			emptyText="*This collection contains no notes.*"
		/>
	);
};

export default CollectionNotes;
