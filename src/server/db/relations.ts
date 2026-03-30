import { defineRelations } from 'drizzle-orm';

import * as schema from './schema';

export const relations = defineRelations(schema, r => ({
	user: {
		accounts: r.many.account(),
		sessions: r.many.session(),
		trees: r.many.talentTrees(),
		builds: r.many.savedBuilds(),
		collections: r.many.collections()
	},
	talentTrees: {
		createdBy: r.one.user({ from: r.talentTrees.createdById, to: r.user.id }),
		collectionTrees: r.many.collectionTrees()
	},
  collections: {
    createdBy: r.one.user({ from: r.collections.createdById, to: r.user.id }),
    collectionTrees: r.many.collectionTrees()
  },
  collectionTrees: {
    collection: r.one.collections({ from: r.collectionTrees.collectionId, to: r.collections.id }),
    tree: r.one.talentTrees({ from: r.collectionTrees.treeId, to: r.talentTrees.id })
  },
  savedBuilds: {
    createdBy: r.one.user({ from: r.savedBuilds.createdById, to: r.user.id })
  }
}));
