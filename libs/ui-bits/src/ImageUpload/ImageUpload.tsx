//@ts-ignore
import * as tus from 'tus-js-client';
import classnames from 'classnames';
import { imageAndVideoMimes, imageMimes } from '@lyku/defaults';
import { api, apiHost, protocol } from 'monolith-ts-api';
import { ReactNode, createRef, useCallback, useEffect, useState } from 'react';

import { ImageDraft, ImageUploadReason, VideoDraft } from '@lyku/json-models';

import times from '../../times.svg';
import bg from '../Backdrop/blu.jpg';
import { Button } from '../Button';
import buttonStyles from '../Button/Button.module.sass';
import { Image, Shape } from '../Image';
import { Loading } from '../LoadingOverlay';
import { formImageUrl } from '../formImageUrl';
import replace from '../assets/replace.svg';
import check from '../assets/squircle-check.svg';
import x from '../assets/x.svg';
import styles from './ImageUpload.module.sass';
import smile from '../smile.png';

export type ImageUploadHandler = (input: HTMLInputElement) => void;
type Props = {
	disabled?: boolean;
	className?: string;
	children?: ReactNode;
	onUpload?: (id: string) => void;
	channelId?: bigint;
	reason: ImageUploadReason;
	working?: boolean;
	reverse?: boolean;
	shape?: Shape;
	allowVideo?: boolean;
} & (
	| { image?: string }
	| {
			file: File;
			removeClicked?: () => void;
			attachmentUploadPack: ImageDraft | VideoDraft;
			onFinished: () => void;
	  }
);

export const defaultImages: Partial<Record<ImageUploadReason, string>> = {
	// ActiveChannelBackground: bg,
	// AwayChannelBackground: bg,
	// ChannelLogo: 'bbce90da-abe2-4970-4b54-6c9034496d00',
	ProfilePicture: smile,
	PostAttachment: '33d9691d-d3cf-49ef-3c85-7b3571dd4e00',
};
const readFile = (file: File): Promise<string> =>
	new Promise((r, j) => {
		const ass = new FileReader();
		ass.onload = () => r(ass.result as string);
		ass.readAsDataURL(file);
	});

/**
 * @noInheritDoc
 */
export const ImageUpload = (props: Props) => {
	const [image, setImage] = useState<string>();
	const [base64, setBase64] = useState<string>();
	const [uploadUrl, setUploadUrl] = useState<string>();
	const [file, setFile] = useState<File>();
	const [working, setWorking] = useState(props.working);
	const [inputId] = useState(String(Math.random()).substring(2));
	const formRef = createRef<HTMLFormElement>();
	const [pack, setPack] = useState<{ url: string; id: string }>();
	const [submitting, setSubmitting] = useState(false);
	const [succeeded, setSucceeded] = useState(false);
	console.log('type', file?.type);

	useEffect(() => {
		setWorking(props.working ?? false);
	}, [props.working]);

	// useEffect(() => {
	// 	setWorking(true);
	// }, [props]);

	useEffect(() => {
		if ('attachmentUploadPack' in props && props.attachmentUploadPack) {
			setPack({
				id: props.attachmentUploadPack.id,
				url: props.attachmentUploadPack.uploadURL,
			});
			setWorking(true);
		}
	}, [props]);

	useEffect(() => {
		if ('file' in props && file !== props.file) setFile(props.file);
	}, [props, file]);

	useEffect(() => {
		if (file) {
			setWorking(true);
			readFile(file).then((logo) => {
				setBase64(logo);
				setWorking(false);
			});
		}
	}, [file]);

	const imageSelected: ImageUploadHandler = async (input) => {
		// Get the f file object from the input
		const f = input.files?.[0];
		setFile(f);
		if (!f) throw new Error('Dafuq');
	};
	const confirmClicked = async () => {
		if (!file) return;
		setWorking(true);
		const res = await api.authorizeImageUpload({
			channelId: props.channelId,
			reason: props.reason,
		});
		setPack(res);
		// this.setState({
		//   uploadUrl:
		//     res.url,
		// });
		console.log('res', res);
	};
	useEffect(() => {
		if (!(pack && file) || submitting || succeeded) return;
		setSubmitting(true);
		// if (!formRef.current) throw "Form doesn't exist";
		const data = new FormData();
		data.append('file', file);
		console.log('Submitting', file);
		if (file.type.startsWith('video/')) {
			const upload = new tus.Upload(file, {
				endpoint: `${protocol}://${apiHost}/getTusEndpoint/${pack.id}`,
				// headers: { 'Allow-Headers': 'Location' },
				onSuccess: () =>
					api.confirmVideoUpload(pack.id).then(() => {
						'onFinished' in props && props.onFinished();
						props.onUpload?.(pack.url);
						setImage(pack.url);
						setSucceeded(true);
						if (props.reason === 'AwayChannelBackground')
							window.location.reload();
					}),
			});
			upload.start();
		} else if (file.type.startsWith('image/')) {
			fetch(pack.url, {
				method: 'POST',
				headers: {
					// 'Content-Type': 'multipart/form-data; boundary='
				},
				body: data,
			}).then((r) =>
				r.json().then(async (cfres) => {
					console.log('CFRes', cfres);

					if (!pack.id) throw new Error('idk lol');

					await api.confirmImageUpload(pack.id);
					'onFinished' in props && props.onFinished();
					props.onUpload?.(pack.url);
					setImage(pack.url);
					setSucceeded(true);
					if (props.reason === 'AwayChannelBackground')
						window.location.reload();
				})
			);
		}
	}, [pack, file, props, submitting, succeeded]);
	const reset = useCallback(
		(image?: string) => {
			console.log('Resetting ImageUpload');
			setPack(undefined);
			setFile(undefined);
			setBase64(undefined);
			setImage(image ?? ('image' in props ? props.image : undefined));
			setUploadUrl(undefined);
			setWorking(false);
			setSubmitting(false);
		},
		[props]
	);

	useEffect(() => {
		if (succeeded) {
			setWorking(false);
			reset();
		}
	}, [succeeded, reset]);
	const logoUrl = () => {
		const id = image || ('image' in props && props.image);
		return id ? formImageUrl(id, 'btvprofile') : defaultImages[props.reason];
	};
	// console.log('base64', base64, working, succeeded);
	return (
		<form
			action={uploadUrl}
			method="post"
			encType="multipart/form-data"
			onSubmit={confirmClicked}
			ref={formRef}
			className={classnames(styles.ImageUpload, {
				[styles.working]: working,
				[styles.succeeded]: succeeded,
			})}
		>
			{'image' in props ? (
				<Image
					size="l"
					url={
						(image ? logoUrl() : base64 ?? logoUrl()) ??
						defaultImages[props.reason]
					}
					shape={props.shape}
				/>
			) : (
				<span className={styles.attachmentImage}>
					{file?.type.startsWith('video/') ? (
						<video src={base64} />
					) : (
						<img src={base64} alt="Attachment" />
					)}
				</span>
			)}
			<Loading floating={true} visible={working} reverse={!pack}></Loading>
			<img
				className={classnames(styles.Success, {
					[styles.visible]: succeeded,
				})}
				src={check}
				alt="Success"
			/>
			<input
				id={inputId}
				accept={props.allowVideo ? imageAndVideoMimes : imageMimes}
				type="file"
				disabled={props.disabled}
				className={classnames(styles.fileInput, props.className)}
				onChange={(event) => imageSelected(event.target as HTMLInputElement)}
			/>
			{/*<input type="submit" disabled={!this.state.uploadUrl} />*/}
			<div className={styles.buttons}>
				{!(working || succeeded) &&
					(base64 ? (
						'file' in props ? (
							props.removeClicked && (
								<Button onClick={props.removeClicked}>
									<img src={times} alt="Remove" />
								</Button>
							)
						) : (
							<>
								<Button onClick={confirmClicked} disabled={working}>
									<img src={check} alt="Confirm" />
								</Button>{' '}
								<Button onClick={() => reset()} disabled={working}>
									<img src={x} alt="Cancel" />
								</Button>
							</>
						)
					) : (
						<label htmlFor={inputId} className={buttonStyles.Button}>
							{props.children ??
								('image' in props && (
									<img className={styles.replace} src={replace} alt="Replace" />
								))}
						</label>
					))}
			</div>
		</form>
	);
};
