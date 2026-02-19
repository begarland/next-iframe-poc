import ContentfulPullContent from "./components/ContentfulPullContent";
import ContentfulPushContent from "./components/ContentfulPushContent";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex w-screen flex-col md:flex-row justify-center items-center">
        <div className="w-1/2">
          <ContentfulPushContent />
        </div>
        <div className="w-1/2">
          <ContentfulPullContent />
        </div>
      </div>
    </div>
  );
}
