import { useState, useEffect } from 'react';
import copy from '../assets/copy.svg';
import linkIcon from '../assets/link.svg';
import loader from '../assets/loader.svg';
import tick from '../assets/tick.svg';
import { ArticleType } from '../libs/types';
import { useLazyGetSummaryQuery } from '../services/article';

const Demo = () => {
  const [article, setArticle] = useState<ArticleType>({
    url: '',
    summary: ''
  });
  const [articlesHistory, setArticlesHistory] = useState<ArticleType[]>([]);
  const [copied, setCopied] = useState<string>('');
  // eslint-disable-next-line
  const [fetchingError, setFetchingError] = useState<any>(null);
  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

  useEffect(() => {
    const articlesFromLocalStorage: ArticleType[] = JSON.parse(
      localStorage.getItem('articles') || '[]'
    );
    if (articlesFromLocalStorage.length > 0) {
      setArticlesHistory(articlesFromLocalStorage);
    }
  }, []);

  useEffect(() => {
    if (error) {
      setFetchingError(error);
    } else {
      setFetchingError(null);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data, error } = await getSummary({ articleUrl: article.url });

    if (data?.summary) {
      const newArticle = { ...article, summary: data.summary };
      setArticle(newArticle);

      const existingArticles: ArticleType[] = JSON.parse(
        localStorage.getItem('articles') || '[]'
      );
      existingArticles.unshift(newArticle);
      if (existingArticles.length > 10) {
        existingArticles.pop(); // Remove the oldest article
      }
      setArticlesHistory([...existingArticles]);
      localStorage.setItem('articles', JSON.stringify(existingArticles));
    }
    if (error) {
      setArticle({
        url: '',
        summary: ''
      });
    }
  };

  const handleCopy = (
    copyUrl: string,
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.stopPropagation();
    setCopied(copyUrl);
    navigator.clipboard.writeText(copyUrl);
    setTimeout(() => setCopied(''), 3000);
  };

  return (
    <section className='mt-16 w-full max-w-xl'>
      {/* Search */}
      <div className='flex flex-col w-full gap-2'>
        <form
          action=''
          className='relative flex justify-center items-center'
          onSubmit={handleSubmit}
        >
          <img
            src={linkIcon}
            alt='linkIcon'
            className='absolute left-0 my-2 ml-3 w-5'
          />
          <input
            type='url'
            placeholder='Enter a URL'
            value={article.url}
            required
            onChange={(e) => {
              setArticle((pre) => {
                return { ...pre, url: e.target.value };
              });
            }}
            className='url_input peer'
          />
          <button
            type='submit'
            className='submit_btn peer-focus:border-gray-700 peer-focus:text-orange-700'
          >
            ↵
          </button>
        </form>
        {/* Browse URL History */}
        <div className='flex flex-col  gap-1 max-h-60 overflow-y-auto'>
          {articlesHistory.map((article, i) => (
            <div
              key={`link-${i}`}
              onClick={() => setArticle(article)}
              className='link_card'
            >
              <div
                className='copy_btn'
                onClick={(e) => handleCopy(article.url, e)}
              >
                <img
                  src={copied === article.url ? tick : copy}
                  alt='copy-icon'
                  className='w-[40%] h-[40%] object-contain'
                />
              </div>
              <p className='flex-1 font-satoshi text-blue-700 font-medium text-sm truncate'>
                {article.url}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Display Results */}
      <div className='my-10 flex mx-w-full justify-center'>
        {isFetching ? (
          <img src={loader} alt='loader' className='w-20 h-20 object-contain' />
        ) : null}
        {error && !article.summary ? (
          <p className='font-inter font-bold text-black text-center'>
            Well, that wasn't supposed to happen, try again or try a different
            website, make sure the website contains an article. <br />
            <span className='font-satoshi font-normal text-gray-700'>
              {fetchingError?.data.error}
            </span>
          </p>
        ) : null}
        {article.summary && !isFetching ? (
          <div className='flex flex-col gap-3'>
            <h2 className='font-satoshi font-bold text-gray-600 text-xl text-center'>
              Article <span className='blue_gradient'>Summary</span>
            </h2>
            <div className='summary_box'>
              <p className='font-inter font-medium text-sm text-gray-700'>
                {article.summary}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default Demo;
