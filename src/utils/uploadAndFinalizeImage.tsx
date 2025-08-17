/* eslint-disable @typescript-eslint/no-explicit-any */
import AWS from 'aws-sdk';
import { upperCase } from 'lodash';

const uploadAndFinalizeImage = async (
  img: any,
  uploadImage: any,
  finaliseUploadImage: any,
  userId : string ,
  isPublic: boolean
) => {
  let media = null;
  const fileType = img.type === 'application/pdf' ? 'DOCUMENT' : upperCase(img.type.split('/')[0]);
  const imageDetails = await uploadImage({
    name: img.name,
    size: img.size / 1024,
    type: fileType,
    public: isPublic ,
    userId 
  });

  const {
    accessKeyId,
    secretAccessKey,
    location,
    sessionToken,
    region,
    bucket,
    mediaId,
  } = imageDetails;

  media = mediaId;

  AWS.config.update({
    region: region, // Update with your desired region
    accessKeyId: accessKeyId, // Update with your AWS Access Key ID
    secretAccessKey: secretAccessKey, // Update with your AWS Secret Access Key
    sessionToken: sessionToken, // Update with your AWS Session Token if applicable
  });

  // Create S3 instance
  const s3 = new AWS.S3();

  // Specify bucket name and object key
  const bucketName = bucket;
  const objectKey = location;
  console.log({
    Bucket: bucketName,
    Key: objectKey,
    Body: img,
    ContentType: img.type,
  })

  // Upload file to S3
  await s3
    .upload({
      Bucket: bucketName,
      Key: objectKey,
      Body: img,
      ContentType: img.type,
    })
    .promise();

  await finaliseUploadImage({
    id: Number(mediaId),
    userId
  });

  return media;
};

export default uploadAndFinalizeImage;
