import { GetStaticProps } from 'next';
import Link from 'next/link';
import { HiOutlineCalendar } from 'react-icons/hi';
import { AiOutlineUser } from 'react-icons/ai';
import Head from 'next/head';
import { useState } from 'react';
import { PrismicDocument } from '@prismicio/types';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';
import { formatDate } from '../helpers/dateFormat';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(props: HomeProps): JSX.Element {
  const { postsPagination } = props;

  const [posts, setPosts] = useState<Post[]>([...postsPagination.results]);

  async function handleLoadingMorePosts(): Promise<void> {
    const { next_page } = postsPagination;

    await fetch(next_page)
      .then(response => response.json())
      .then(data => {
        const nextPosts: Post[] = data.results.map(
          (nextPost: PrismicDocument) => ({
            uid: nextPost.uid,
            first_publication_date: formatDate(nextPost.first_publication_date),
            data: {
              author: nextPost.data.author,
              title: nextPost.data.title,
              subtitle: nextPost.data.subtitle,
            },
          })
        );
        setPosts([...posts, ...nextPosts]);
      });
  }

  return posts.length === 0 ? (
    <h1>Carregando...</h1>
  ) : (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <Header />

      <main className={commonStyles.centralized}>
        {posts.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a href={`/post/${post.uid}`} className={styles.post}>
              <h2>{post.data.title}</h2>

              <h3>{post.data.subtitle}</h3>

              <div className={commonStyles.info}>
                <div>
                  <HiOutlineCalendar size={24} />
                  <span>{formatDate(post.first_publication_date)}</span>
                </div>

                <div>
                  <AiOutlineUser size={24} />
                  <span>{post.data.author}</span>
                </div>
              </div>
            </a>
          </Link>
        ))}

        {postsPagination.next_page ? (
          <button
            type="button"
            onClick={() => handleLoadingMorePosts()}
            className={styles.pagination}
          >
            Carregar mais posts
          </button>
        ) : (
          <></>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.getByType('posts', {
    accessToken: process.env?.PRISMIC_ACCESS_TOKEN,
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 3,
  });
  const posts: Post[] = response.results.map(post => {
    const uid = post.uid as string;
    const author = post.data.author as string;
    const subtitle = post.data.subtitle as string;
    const title = post.data.title as string;
    const { first_publication_date } = post;

    return {
      uid,
      first_publication_date,
      data: {
        title,
        subtitle,
        author,
      },
    };
  });
  const nextPageUrl = response.next_page;

  return {
    props: {
      postsPagination: {
        next_page: nextPageUrl,
        results: posts,
      },
    },
  };
};
