import {upload_on_cloud} from '../Utils/cloudnary.js'
import {ApiError} from "../Utils/apierrors.js" 

/**
 * Uploads avatar and cover image from req.files to Cloudinary.
 * Returns URLs of uploaded images.
 *
 * @param {Object} req - Express request object with req.files
 * @returns {Object} { avatarUrl, coverImageUrl }
 * @throws {ApiError} if files are missing or upload fails
 */
export const uploadUserImages = async (req, res) => {
  const avatarLocalPath = req.files?.Avatar?.[0]?.path || null;
  const coverImageLocalPath = req.files?.CoverImgae?.[0]?.path || null;

  if (!avatarLocalPath) {
//    return res.status(400).json(new ApiError (400,"Avatar File is required"))
        throw new ApiError(400, "Avatar File is required");
  }

  if (!coverImageLocalPath) {
    //    return res.status(400).json(new ApiError (400,"Cover image File is required"))
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

