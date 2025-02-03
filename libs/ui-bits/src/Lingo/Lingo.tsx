import { useState } from 'react';
import styles from './Lingo.module.sass';
import { language } from '../phrasebook';
import { setCookie } from 'monolith-ts-api';
import { Link } from '../Link';
import lingo from '../assets/lingo.svg';
import classNames from 'classnames';
import { Lang } from '@lyku/phrasebooks';
const langs: Partial<Record<Lang, string>> = {
	'en-US': 'English',
	'ru-RU': 'Русский',
	'de-DE': 'Deutsch',
	'fr-FR': 'Français',
	'en-AR': 'Pirate',
	// 'en-US-angry': 'Angry',
	'wa-GH': 'Ork',
} as const;

const languages = Object.entries(langs).map(([code, name]) => ({
	code,
	name,
})) as { code: Lang; name: string }[];

export const Lingo = () => {
	const [selectedLanguage, setSelectedLanguage] = useState<Lang>(
		language in langs ? (language as Lang) : 'en-US'
	);
	const [isOpen, setIsOpen] = useState(false);

	const handleLanguageChange = (language: Lang) => {
		setSelectedLanguage(language);
		setIsOpen(false);
		setCookie('lang', language, 365);
		window.location.reload();
		// Here you would also handle the side modifiers of language change,
		// like updating a context, localizing content, etc.
	};

	return (
		<div className={styles.languageSelector}>
			<Link
				className={styles.languageSelectorButton}
				onClick={() => setIsOpen(!isOpen)}
			>
				<img src={lingo} className={styles.globe} alt="Language selector" />
				{/*{langs[selectedLanguage]}*/}
			</Link>
			{isOpen && (
				<ul className={styles.languageOptions}>
					{languages.map((language) => (
						<li
							key={language.code}
							onClick={() => handleLanguageChange(language.code)}
							className={classNames({
								[styles.selected]: selectedLanguage === language.code,
							})}
						>
							{language.name}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};
