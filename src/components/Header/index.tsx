import Link from 'next/link';
import Image from 'next/image';

import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={`${styles.container} ${commonStyles.centralized}`}>
      <Link href="/">
        <div>
          <Image
            src="/images/logo.svg"
            alt="logo"
            width={238.62}
            height={25.63}
          />
        </div>
      </Link>
    </header>
  );
}
