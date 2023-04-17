import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { HiOutlineCalendar } from 'react-icons/hi';
import { AiOutlineClockCircle, AiOutlineUser } from 'react-icons/ai';
import * as prismicHelpers from '@prismicio/helpers';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';
import { formatDate } from '../../helpers/dateFormat';

type Content = {
  heading: string;
  body: {
    text: string;
  }[];
};

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: Content[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post(props: PostProps): JSX.Element {
  const { post } = props;
  const router = useRouter();
  const wordCount = post.data.content.reduce((pre, cur) => {
    const n1 = cur.heading?.split(' ').length;
    const n2 = cur.body?.reduce((p, c) => {
      return p + c.text.split(/\s/g).length;
    }, 0);
    return pre + n1 + n2;
  }, 0);
  const estimatedReadingTime = Math.floor(wordCount / 200) + 1;
  const textFormatted = post.data.content
    .map(content => {
      const heading = `<h2 class="${styles.heading}">${content.heading}</h2>`;
      const body = `<div class="${styles.text}">${prismicHelpers.asHTML(
        content.body as []
      )}</div>`;
      return heading + body;
    })
    .join('');

  return router.isFallback ? (
    <>Carregando...</>
  ) : (
    <>
      <Header />

      <main className={styles.main}>
        <div className={styles.banner} />

        <article className={commonStyles.centralized}>
          <h1 className={styles.title}>{post.data.title}</h1>

          <div className={`${commonStyles.info} ${styles.info}`}>
            <div>
              <HiOutlineCalendar size={24} />
              <span>{formatDate(post.first_publication_date)}</span>
            </div>

            <div>
              <AiOutlineUser size={24} />
              <span>{post.data.author}</span>
            </div>

            <div>
              <AiOutlineClockCircle size={24} />
              <span>{estimatedReadingTime} min</span>
            </div>
          </div>

          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: textFormatted }} />
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async args => {
  return {
    paths: [
      {
        params: { slug: 'como-utilizar-hooks' },
      },
      {
        params: { slug: 'criando-um-app-cra-do-zero' },
      },
    ],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async props => {
  const { params } = props;
  const slug = params?.slug?.toString() ?? '';
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', slug);
  const content = response.data.content.map((ctt: Content) => {
    return {
      heading: ctt.heading,
      body: ctt.body,
    };
  });
  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: response.data.banner,
      content,
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 60,
  };
};
