import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Yuk Livestream</h1>
      <Link href="/host" className="mb-2 text-blue-600 underline">Host Stream</Link>
      <Link href="/watch/test" className="text-blue-600 underline">Watch Stream</Link>
    </div>
  );
}
