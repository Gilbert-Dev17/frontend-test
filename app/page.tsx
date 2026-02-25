'use client'; // Required for using hooks

import { useRouter } from 'next/navigation';

const page = () => {
  const router = useRouter();

  const handleRedirect = () => {
    router.push('/dashboard/case-tracker');
  };

  return (
    <div>
      <h1>Current Page</h1>
      <button onClick={handleRedirect}>Go to Case Tracker</button>
    </div>
  );
}

export default page;