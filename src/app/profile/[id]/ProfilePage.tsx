import { notFound } from 'next/navigation';
import { Heart } from 'lucide-react';

import { getSession } from '#auth/server.ts';
import PageTitle from '#components/layout/PageTitle.tsx';
import BuildGridItem from '#components/styled/BuildGridItem.tsx';
import CollectionGridItem from '#components/styled/CollectionGridItem.tsx';
import TextButton from '#components/styled/TextButton.tsx';
import TreeGridItem from '#components/styled/TreeGridItem.tsx';
import { UserAvatar, UserRoleText } from '#components/styled/User.tsx';
import { getUser } from '#server/api/users.ts';

import AdminPanel from './AdminPanel';

type Props = { id: string };

const ProfilePage = async ({ id }: Props) => {
	const [user, session] = await Promise.all([getUser({ id }), getSession()]);

	if (!user) return notFound();

	const isOwnProfile = session?.user?.id === id;
	const showPrivate = isOwnProfile || session?.user?.role === 'admin';
	const roleLabel =
		user.role === 'admin'
			? 'Administrator'
			: user.role === 'supporter'
				? 'Supporter'
				: 'Community Member';

	const oldestTree = user.trees.at(-1)?.createdAt;
	const filteredTrees = user.trees.filter(
		t => t.visibility === 'public' || showPrivate
	);
	const filteredCollections = (user.collections ?? []).filter(
		c => c.visibility === 'public' || showPrivate
	);

	return (
		<>
			<section className="haax-surface-4 flex-row flex-wrap items-end justify-center">
				<UserAvatar image={user.image} size={160} />

				<div className="flex grow flex-col gap-1">
					<h1 className="haax-color text-3xl sm:text-5xl">{user.name}</h1>
					<UserRoleText role={user.role} className="text-xl">
						{roleLabel}
					</UserRoleText>
					{!!oldestTree && (
						<p className="text-blue-gray text-sm">
							Active since{' '}
							{new Date(oldestTree).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long'
							})}
						</p>
					)}
					<p className="text-blue-gray text-sm">
						{user.trees.length} tree{user.trees.length !== 1 ? 's' : ''} •{' '}
						{user.builds.length} build{user.builds.length !== 1 ? 's' : ''}
					</p>
				</div>
			</section>

			{isOwnProfile && user.role !== 'admin' && (
				<div className="haax-surface-3 -mt-5 items-center text-center md:flex-row">
					{user.role === 'supporter' ? (
						<p className="text-supporter grow text-sm">
							<Heart className="mr-1 inline-block size-5" />
							Thank you for supporting Talent Builder! Your support helps keep
							the project online and actively maintained.
						</p>
					) : (
						<>
							<p className="text-supporter shrink grow text-lg">
								Enjoying Talent Builder? Support development to help keep the
								project online and unlock supporter perks.
							</p>
							<TextButton
								type="link"
								icon={
									<img
										src="https://storage.ko-fi.com/cdn/logomarkLogo.png"
										alt="Ko-fi logo"
										className="h-6 pr-1"
									/>
								}
								href="https://ko-fi.com/haaxor1689"
								external
								className="rounded-full border-2 border-current/30 px-4 py-3 text-2xl font-bold text-supporter"
							>
								Donate on Ko‑fi
							</TextButton>
						</>
					)}
				</div>
			)}

			<section className="contents">
				<PageTitle title="Trees" />
				{filteredTrees.length ? (
					<div className="haax-surface-3 grid items-start md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))]">
						{filteredTrees.map(tree => (
							<TreeGridItem
								key={tree.id}
								item={{
									...tree,
									createdBy: {
										image: user.image,
										name: user.name,
										role: user.role
									}
								}}
								href={`/tree/${tree.slug ?? tree.id}`}
							/>
						))}
					</div>
				) : (
					<div className="haax-surface-6 text-blue-gray flex min-h-24 items-center justify-center text-center">
						No public trees created yet.
					</div>
				)}
			</section>

			<section className="contents">
				<PageTitle title="Builds" />
				{user.builds.length ? (
					<div className="haax-surface-3 grid items-start md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))]">
						{user.builds.map(build => (
							<BuildGridItem
								key={build.id}
								{...build}
								href={`/calculator/${build.slug ?? build.id}`}
								createdBy={{
									image: user.image,
									name: user.name,
									role: user.role
								}}
							/>
						))}
					</div>
				) : (
					<div className="haax-surface-6 text-blue-gray flex min-h-24 items-center justify-center text-center">
						No builds created yet.
					</div>
				)}
			</section>

			<section className="contents">
				<PageTitle title="Collections" />
				{filteredCollections.length ? (
					<div className="haax-surface-3 grid items-start md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))]">
						{filteredCollections.map(collection => (
							<CollectionGridItem
								key={collection.id}
								item={{
									...collection,
									createdBy: {
										image: user.image,
										name: user.name,
										role: user.role
									}
								}}
								href={`/collections/${collection.slug ?? collection.id}`}
							/>
						))}
					</div>
				) : (
					<div className="haax-surface-6 text-blue-gray flex min-h-24 items-center justify-center text-center">
						No public collections created yet.
					</div>
				)}
			</section>

			{isOwnProfile && user.role === 'admin' && (
				<section className="contents">
					<PageTitle title="Admin Panel" />
					<AdminPanel />
				</section>
			)}
		</>
	);
};

export default ProfilePage;
