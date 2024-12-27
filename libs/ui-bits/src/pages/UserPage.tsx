import { api } from 'monolith-ts-api';
import { PostList } from '../PostList';
import { ProfilePicture } from '../ProfilePicture';
import { phrasebook } from '../phrasebook';
import { Divisio } from '../Divisio';
import { Center } from '../Center';
import { BefriendUser } from '../BefriendUser';
import styles from './UserPage.module.sass';
import { FollowUser } from '../FollowUser';
import { Await } from 'awaitx';

const pathWithUsernameOrIdRegex = new RegExp(`^/u(?:ser)?/([^/]+)$`);
console.log('Mighty Regex', pathWithUsernameOrIdRegex);
const getUsernameOrIdFromUrl = () =>
	window.location.pathname.match(pathWithUsernameOrIdRegex)?.[1];
const ident = getUsernameOrIdFromUrl();
export const UserPage = () =>
	ident ? (
		<Await
			source={() =>
				Promise.all([
					api.listUserPosts({ user: ident }),
					api.getUserByName(ident),
				])
			}
			then={([posts, user]) => (
				<Center>
					<div className={styles.UserPage}>
						<Divisio
							size={'m'}
							layout={'h'}
							hang={
								user && (
									<div className={styles.linkBox}>
										<Divisio size="m" layout="v">
											<FollowUser user={user} />
											<BefriendUser user={user} />
										</Divisio>
									</div>
								)
							}
						>
							<ProfilePicture size={'l'} url={user?.profilePicture} />
							<Divisio size={'m'} layout={'v'}>
								<h1>{user?.username ?? 'User'}</h1>
								<p>{phrasebook.bioWip}</p>
							</Divisio>
						</Divisio>
						{posts && <PostList posts={posts} />}
					</div>
				</Center>
			)}
		/>
	) : (
		<h1>404</h1>
	);
