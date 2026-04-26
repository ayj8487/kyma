import Link from "next/link";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <>
      {/* Hide the global Navbar on the 404 page (SSR-time, no flash). */}
      <style dangerouslySetInnerHTML={{ __html: "nav{display:none!important}" }} />

      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-pink-50 dark:bg-pink-950/30">
            <AlertTriangle size={40} className="text-pink-500" />
          </div>

          <h1 className="text-7xl font-bold text-pink-500">404</h1>
          <p className="mt-4 text-xl font-semibold text-gray-900 dark:text-zinc-100">
            잘못된 접근입니다.
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            요청하신 페이지를 찾을 수 없습니다.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pink-600"
            >
              <Home size={16} />
              홈으로
            </Link>
            <Link
              href="/dashboard"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <ArrowLeft size={16} />
              대시보드로
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
