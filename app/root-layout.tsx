import { useStore } from '@nanostores/react';
import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { themeStore } from './lib/stores/theme';
import { ToastContainer } from 'react-toastify';

export default function Root() {
  const theme = useStore(themeStore);

  useEffect(() => {
    document.querySelector('html')?.setAttribute('data-theme', theme);
    document.body.className = 'bg-white dark:bg-jumbo-elements-bg-depth-1';
  }, [theme]);

  return (
    <>
      <div id="root" className="w-full h-full">
        <Outlet />
      </div>
      <ToastContainer position="bottom-right" theme={theme === 'dark' ? 'dark' : 'light'} />
    </>
  );
}
