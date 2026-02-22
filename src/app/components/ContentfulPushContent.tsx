import * as dotenv from "dotenv";
import ContentfulForm from "./ContentfulForm/ContentfulForm";
// import * as contentful from 'contentful'

dotenv.config();

const ContentfulPushContent = async () => {
  return (
    <div className="flex flex-col justify-center items-center gap-5">
      <ContentfulForm />
    </div>
  );
};

export default ContentfulPushContent;
