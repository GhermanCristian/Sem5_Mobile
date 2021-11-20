import { useCamera } from '@ionic/react-hooks/camera';
import { CameraPhoto, CameraResultType, CameraSource, FilesystemDirectory } from '@capacitor/core';
import { useEffect, useState } from 'react';
import { base64FromPath, useFilesystem } from '@ionic/react-hooks/filesystem';
import { useStorage } from '@ionic/react-hooks/storage';

export interface Photo {
    filepath: string;
    webviewPath?: string;
}

const PHOTO_STORAGE = 'photos';

export function usePhotoGallery() {
    const {getPhoto} = useCamera();
    const [photos, setPhotos] = useState<Photo[]>([]);

    const takePhoto = async () => {
        try {
            const cameraPhoto = await getPhoto({
                resultType: CameraResultType.Uri,
                source: CameraSource.Camera,
                quality: 100
            });
            const fileName = new Date().getTime() + '.jpeg';
            const savedFileImage = await savePicture(cameraPhoto, fileName);
            const newPhotos = [savedFileImage, ...photos];
            setPhotos(newPhotos);
            await set(PHOTO_STORAGE, JSON.stringify(newPhotos));
            return savedFileImage.webviewPath;
        }
        catch (e) {
            console.log("error - takephoto");
            return '';
        }
    };

    const {deleteFile, readFile, writeFile} = useFilesystem();
    const savePicture = async (photo: CameraPhoto, fileName: string): Promise<Photo> => {
        const base64Data = await base64FromPath(photo.webPath!);
        await writeFile({
            path: fileName,
            data: base64Data,
            directory: FilesystemDirectory.Data
        });

        return {
            filepath: fileName,
            webviewPath: photo.webPath
        };
    };

    const {get, set} = useStorage();
    useEffect(() => {
        const loadSaved = async () => {
            let photosString: string | null = "";
            try {
                photosString = await get(PHOTO_STORAGE);
            }
            catch (e) {
                console.log(e);
            }

            const photos = (photosString && photosString.length > 0 ? JSON.parse(photosString) : []) as Photo[];
            for (let photo of photos) {
                try {
                    const file = await readFile({
                        path: photo.filepath,
                        directory: FilesystemDirectory.Data
                    });
                    photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
                }
                catch (e) {
                    console.log("error - loadsaved");
                    setPhotos([]);
                    return;
                }
            }
            setPhotos(photos);
        };
        loadSaved().then(r => console.log(r), error => console.log(error));
    }, [get, readFile]);

    const deletePhoto = async (photo: Photo) => {
        const newPhotos = photos.filter(p => p.filepath !== photo.filepath);
        await set(PHOTO_STORAGE, JSON.stringify(newPhotos));
        const filename = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);
        await deleteFile({
            path: filename,
            directory: FilesystemDirectory.Data
        });
        setPhotos(newPhotos);
    };

    return {
        photos,
        takePhoto,
        deletePhoto,
    };
}
