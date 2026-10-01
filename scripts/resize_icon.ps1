Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\vishn\.gemini\antigravity-ide\brain\860be20b-e8ff-405f-bd33-5b2efc3fb7ac\.user_uploaded\media_1790846686526.png"
$srcImg = [System.Drawing.Image]::FromFile($srcPath)

$destSize = 512
$destBmp = New-Object System.Drawing.Bitmap($destSize, $destSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($destBmp)

$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

$g.Clear([System.Drawing.Color]::Transparent)

# Centered with small padding
$margin = 20
$drawWidth = $destSize - ($margin * 2)
$drawHeight = $destSize - ($margin * 2)
$destRect = New-Object System.Drawing.Rectangle($margin, $margin, $drawWidth, $drawHeight)

$g.DrawImage($srcImg, $destRect)
$g.Dispose()
$srcImg.Dispose()

$destBmp.Save("public\est-logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$destBmp.Save("public\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$destBmp.Save("src\assets\est-logo.png", [System.Drawing.Imaging.ImageFormat]::Png)

$destBmp.Dispose()

Write-Output "Successfully generated 512x512 crisp icon!"
