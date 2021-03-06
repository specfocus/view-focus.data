import { useState } from 'react';
import { QueryClient, QueryClientProvider, useIsMutating } from 'react-query';
import { DataProviderContext } from '../../providers/DataProviderContext';
import undoableEventEmitter from '../../providers/undoableEventEmitter';
import { useGetOne } from '../get-one/useGetOne';
import { useUpdate } from './useUpdate';

export default { title: 'dataProvider/useUpdate/undoable' };

export const SuccessCase = () => {
  const posts = [{ id: 1, title: 'Hello', author: 'John Doe' }];
  const dataProvider = {
    getOne: (resource, params) => {
      console.log('getOne', resource, params);
      return Promise.resolve({
        data: posts.find(p => p.id === params.id),
      });
    },
    update: (resource, params) => {
      console.log('update', resource, params);
      return new Promise(resolve => {
        setTimeout(() => {
          const post = posts.find(p => p.id === params.id);
          post.title = params.data.title;
          resolve({ data: post });
        }, 1000);
      });
    },
  } as any;
  return (
    <QueryClientProvider client={new QueryClient()}>
      <DataProviderContext.Provider
        value={dataProvider}
      >
        <SuccessCore />
      </DataProviderContext.Provider>
    </QueryClientProvider>
  );
};

const SuccessCore = () => {
  const isMutating = useIsMutating();
  const [notification, setNotification] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>();
  const { data, refetch } = useGetOne('posts', { id: 1 });
  const [update, { isLoading }] = useUpdate();
  const handleClick = () => {
    update(
      'posts',
      {
        id: 1,
        data: { title: 'Hello World' },
      },
      {
        mutationMode: 'undoable',
        onSuccess: () => setSuccess('success'),
      }
    );
    setNotification(true);
  };
  return (
    <>
      <dl>
        <dt>title</dt>
        <dd>{data?.title}</dd>
        <dt>author</dt>
        <dd>{data?.author}</dd>
      </dl>
      <div>
        {notification ? (
          <>
            <button
              onClick={() => {
                undoableEventEmitter.emit('end', {
                  isUndo: false,
                });
                setNotification(false);
              }}
            >
              Confirm
            </button>
            &nbsp;
            <button
              onClick={() => {
                undoableEventEmitter.emit('end', {
                  isUndo: true,
                });
                setNotification(false);
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <button onClick={handleClick} disabled={isLoading}>
            Update title
          </button>
        )}
        &nbsp;
        <button onClick={() => refetch()}>Refetch</button>
      </div>
      {success && <div>{success}</div>}
      {isMutating !== 0 && <div>mutating</div>}
    </>
  );
};

export const ErrorCase = () => {
  const posts = [{ id: 1, title: 'Hello', author: 'John Doe' }];
  const dataProvider = {
    getOne: (resource, params) => {
      console.log('getOne', resource, params);
      return Promise.resolve({
        data: posts.find(p => p.id === params.id),
      });
    },
    update: (resource, params) => {
      console.log('update', resource, params);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('something went wrong'));
        }, 1000);
      });
    },
  } as any;
  return (
    <QueryClientProvider client={new QueryClient()}>
      <DataProviderContext.Provider
        value={dataProvider}
      >
        <ErrorCore />
      </DataProviderContext.Provider>
    </QueryClientProvider>
  );
};

const ErrorCore = () => {
  const isMutating = useIsMutating();
  const [notification, setNotification] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>();
  const [error, setError] = useState<any>();
  const { data, refetch } = useGetOne('posts', { id: 1 });
  const [update, { isLoading }] = useUpdate();
  const handleClick = () => {
    update(
      'posts',
      {
        id: 1,
        data: { title: 'Hello World' },
      },
      {
        mutationMode: 'undoable',
        onSuccess: () => setSuccess('success'),
        onError: e => {
          setError(e);
          setSuccess('');
        },
      }
    );
    setNotification(true);
  };
  return (
    <>
      <dl>
        <dt>title</dt>
        <dd>{data?.title}</dd>
        <dt>author</dt>
        <dd>{data?.author}</dd>
      </dl>
      <div>
        {notification ? (
          <>
            <button
              onClick={() => {
                undoableEventEmitter.emit('end', {
                  isUndo: false,
                });
                setNotification(false);
              }}
            >
              Confirm
            </button>
            &nbsp;
            <button
              onClick={() => {
                undoableEventEmitter.emit('end', {
                  isUndo: true,
                });
                setNotification(false);
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <button onClick={handleClick} disabled={isLoading}>
            Update title
          </button>
        )}
        &nbsp;
        <button onClick={() => refetch()}>Refetch</button>
      </div>
      {success && <div>{success}</div>}
      {error && <div>{error.message}</div>}
      {isMutating !== 0 && <div>mutating</div>}
    </>
  );
};
