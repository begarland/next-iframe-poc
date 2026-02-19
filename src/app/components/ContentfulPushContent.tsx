import * as dotenv from "dotenv";
import UploadToContentfulButton from "../components/UploadToContentfulButton";
import ContentfulForm from "./ContentfulForm";
// import * as contentful from 'contentful'

dotenv.config();

const ContentfulPushContent = async () => {
  return (
    <div className="flex flex-col justify-center items-center gap-5">
      <ContentfulForm />
      upload/edit a contentful entry
      <UploadToContentfulButton />
    </div>
  );
};

export default ContentfulPushContent;
