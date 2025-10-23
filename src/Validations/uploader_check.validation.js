import {upload_on_cloud} from '../Utils/cloudnary.js'
import {ApiError} from "../Utils/apierrors.js" 

/**
 
 * @param {Object} req 
 * @returns {Object} 
 * @throws {ApiError} 
 */
export const uploadUserImages = async (req, res) => {
  console.log("Files received in uploader_check.validation.js:", req.files);
  const avatarLocalPath = req.files?.Avatar?.[0]?.path || null;
  const coverImageLocalPath = req.files?.CoverImage?.[0]?.path || null;

  if (!avatarLocalPath) {

        throw new ApiError(400, "Avatar File is required");
  }

  if (!coverImageLocalPath) {
  
    throw new ApiError(400, "Cover Image File is required");
  }

  const avatar = await upload_on_cloud(avatarLocalPath);
  const coverImage = await upload_on_cloud(coverImageLocalPath);

  if (!avatar?.url) {
    throw new ApiError(400, "Failed to upload avatar to Cloudinary");
  }

  if (!coverImage?.url) {
    throw new ApiError(400, "Failed to upload cover image to Cloudinary");
  }

  return {
    avatarUrl: avatar.url,
    coverImageUrl: coverImage.url,
  };
};

