import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    console.log("[ProfilePhoto] Upload started")
    const user = await requireAuth()
    console.log("[ProfilePhoto] User authenticated:", user.id)
    
    const formData = await request.formData()
    const file = formData.get("photo") as File

    if (!file) {
      console.log("[ProfilePhoto] No file provided")
      return Response.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[ProfilePhoto] File received:", file.name, file.type, file.size)

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      console.log("[ProfilePhoto] Invalid file type:", file.type)
      return Response.json({ error: "Invalid file type. Only JPG, PNG, and WebP allowed" }, { status: 400 })
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      console.log("[ProfilePhoto] File too large:", file.size)
      return Response.json({ error: "File too large. Maximum 5MB allowed" }, { status: 400 })
    }

    // Check environment variables
    console.log("[ProfilePhoto] Checking env vars...")
    console.log("[ProfilePhoto] CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "SET" : "NOT SET")
    console.log("[ProfilePhoto] CLOUDINARY_UPLOAD_PRESET:", process.env.CLOUDINARY_UPLOAD_PRESET ? "SET" : "NOT SET")

    // Upload to Cloudinary
    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append("file", file)
    cloudinaryFormData.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET || "")
    cloudinaryFormData.append("folder", "cryptofd-profiles")
    cloudinaryFormData.append("resource_type", "auto")

    const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`
    console.log("[ProfilePhoto] Uploading to Cloudinary:", uploadUrl)

    const cloudinaryResponse = await fetch(uploadUrl, {
      method: "POST",
      body: cloudinaryFormData,
    })

    console.log("[ProfilePhoto] Cloudinary response status:", cloudinaryResponse.status)

    if (!cloudinaryResponse.ok) {
      const errorData = await cloudinaryResponse.text()
      console.log("[ProfilePhoto] Cloudinary error:", errorData)
      throw new Error(`Cloudinary upload failed: ${cloudinaryResponse.status} ${errorData}`)
    }

    const cloudinaryData = await cloudinaryResponse.json()
    console.log("[ProfilePhoto] Cloudinary response:", cloudinaryData)
    
    const imageUrl = cloudinaryData.secure_url
    console.log("[ProfilePhoto] Image URL:", imageUrl)

    // Update user profile with Cloudinary URL
    const profile = await prisma.profile.update({
      where: { id: user.id },
      data: {
        profilePhoto: imageUrl,
      },
    })

    console.log("[ProfilePhoto] Profile updated successfully")

    return Response.json({
      success: true,
      message: "Photo uploaded successfully",
      photo: profile.profilePhoto,
    })
  } catch (error) {
    console.error("[ProfilePhoto] Upload error:", error)
    return Response.json({ error: "Failed to upload photo" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth()

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { profilePhoto: true },
    })

    return Response.json({
      photo: profile?.profilePhoto || null,
    })
  } catch (error) {
    console.error("Photo fetch error:", error)
    return Response.json({ error: "Failed to fetch photo" }, { status: 500 })
  }
}
