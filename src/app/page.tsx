import ContentfulPullContent from "./components/ContentfulPullContent";
import ContentfulPushContent from "./components/ContentfulPushContent";
import WindowListener from "./components/WindowListener/WindowListener";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-pink-100 font-sans">
      <WindowListener />
      <div className="flex w-screen flex-col md:flex-row justify-center items-start">
        <div className="w-full lg:w-1/2">
          <ContentfulPushContent />
        </div>
        <div className="w-full lg:w-1/2">
          <ContentfulPullContent />
        </div>
      </div>
    </div>
  );
}
