from PIL import Image
import os

# 获取图片宽高比的函数
def get_image_aspect_ratio(image_path):
    try:
        with Image.open(image_path) as img:
            width, height = img.size
            aspect_ratio = width / height
            return aspect_ratio, width, height
    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        return None, None, None

# 需要检查的图片列表
images = [
    "login-method-admin-step1.png",
    "login-method-admin-step2.png",
    "login-method-admin-step3.png",
    "login-method-step1.png",
    "login-method-step2.png"
]

# 遍历图片并打印宽高比
for image in images:
    if os.path.exists(image):
        aspect_ratio, width, height = get_image_aspect_ratio(image)
        if aspect_ratio is not None:
            print(f"{image}: {width}x{height}, aspect ratio: {aspect_ratio:.2f}")
    else:
        print(f"{image} not found")
