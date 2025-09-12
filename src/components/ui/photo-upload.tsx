'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, X, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface PhotoUploadProps {
  photos: File[]
  onPhotosChange: (photos: File[]) => void
  maxPhotos?: number
  disabled?: boolean
}

export function PhotoUpload({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 5, 
  disabled = false 
}: PhotoUploadProps) {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      setCameraStream(stream)
      setIsCameraOpen(true)
      
      // Set video stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('No se pudo acceder a la cámara. Verifique los permisos.')
    }
  }, [])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setIsCameraOpen(false)
  }, [cameraStream])

  // Take photo
  const takePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo-${Date.now()}.jpg`, {
              type: 'image/jpeg',
            })
            onPhotosChange([...photos, file])
            stopCamera()
          }
        }, 'image/jpeg', 0.8)
      }
    }
  }, [photos, onPhotosChange, stopCamera])

  // Handle file upload (shared logic)
  const processFiles = useCallback((files: File[]) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (validFiles.length !== files.length) {
      alert('Solo se permiten archivos de imagen')
    }
    
    const remainingSlots = maxPhotos - photos.length
    const filesToAdd = validFiles.slice(0, remainingSlots)
    
    if (filesToAdd.length < validFiles.length) {
      alert(`Solo se pueden agregar ${remainingSlots} fotos más`)
    }
    
    onPhotosChange([...photos, ...filesToAdd])
  }, [photos, onPhotosChange, maxPhotos])

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    processFiles(files)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle drag and drop events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && photos.length < maxPhotos && e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true)
    }
  }, [disabled, photos.length, maxPhotos])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && photos.length < maxPhotos && e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true)
    }
  }, [disabled, photos.length, maxPhotos])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only hide drag overlay if leaving the main container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    
    if (disabled || photos.length >= maxPhotos) return
    
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }, [disabled, photos.length, maxPhotos, processFiles])

  // Remove photo
  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    onPhotosChange(newPhotos)
  }

  // Create preview URL
  const createPreviewUrl = (file: File) => {
    return URL.createObjectURL(file)
  }

  return (
    <div 
      className="space-y-4"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Upload Controls */}
      <div className="flex flex-wrap gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              onClick={startCamera}
              disabled={disabled || photos.length >= maxPhotos}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Tomar Foto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Capturar Foto</DialogTitle>
              <DialogDescription>
                Apunta la cámara hacia la garantía y toma la foto
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {isCameraOpen ? (
                <div className="space-y-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg bg-black"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="flex gap-2 justify-center">
                    <Button onClick={takePhoto} size="lg">
                      <Camera className="h-4 w-4 mr-2" />
                      Capturar
                    </Button>
                    <Button variant="outline" onClick={stopCamera}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>La cámara se está iniciando...</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || photos.length >= maxPhotos}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Subir Archivo
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Photo Count */}
      <div className="text-sm text-muted-foreground">
        {photos.length} de {maxPhotos} fotos
      </div>

      {/* Drag Overlay */}
      {isDragOver && (
        <div className="fixed inset-0 bg-primary/10 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-background border-2 border-dashed border-primary rounded-lg p-8 text-center">
            <Upload className="h-16 w-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">
              Suelta las imágenes aquí
            </h3>
            <p className="text-muted-foreground">
              Se agregarán a las fotos existentes
            </p>
          </div>
        </div>
      )}

      {/* Photos Grid */}
      {photos.length > 0 && (
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${
          isDragOver ? 'opacity-50' : ''
        }`}>
          {photos.map((photo, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="relative aspect-square">
                  <img
                    src={createPreviewUrl(photo)}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                  
                  {/* Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => setPreviewPhoto(createPreviewUrl(photo))}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Foto {index + 1}</DialogTitle>
                        </DialogHeader>
                        <img
                          src={createPreviewUrl(photo)}
                          alt={`Foto ${index + 1}`}
                          className="w-full rounded-lg"
                        />
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => removePhoto(index)}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Remove button (always visible on mobile) */}
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 md:hidden"
                    onClick={() => removePhoto(index)}
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {photo.name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && (
        <Card 
          className={`border-dashed transition-all ${
            isDragOver 
              ? 'border-primary bg-primary/5 border-2' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
        >
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Camera className={`h-12 w-12 mb-4 ${
              isDragOver ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <h3 className="text-lg font-medium mb-2">
              {isDragOver ? 'Suelta las imágenes aquí' : 'Agregar Fotos'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {isDragOver 
                ? 'Suelta los archivos para subirlos' 
                : 'Arrastra y suelta imágenes, toma fotos o sube archivos'
              }
            </p>
            {!isDragOver && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={startCamera}
                  disabled={disabled}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Tomar Foto
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Archivo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}