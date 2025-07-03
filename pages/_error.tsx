import React from 'react';
import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-4">Terjadi Kesalahan</h1>
      <p className="text-lg mb-2">
        {statusCode
          ? `Server error ${statusCode}`
          : 'An unexpected error has occurred.'}
      </p>
      <a href="/" className="text-blue-600 underline">Kembali ke Beranda</a>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
