import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Alert } from "react-native";

import { Book } from "../models/book";

const BOOKS_DIRECTORY_NAME = "Doculearn";

const booksDirUri = `${FileSystem.documentDirectory}${BOOKS_DIRECTORY_NAME}/`;

const ensureBooksDirectoryExists = async () => {
  await FileSystem.makeDirectoryAsync(booksDirUri, { intermediates: true });
};

export const getBooks = async (searchTerm?: string): Promise<Book[]> => {
  await ensureBooksDirectoryExists();

  try {
    const bookFolderNames = await FileSystem.readDirectoryAsync(booksDirUri);
    const books: Book[] = [];

    for (const folderName of bookFolderNames) {
      const bookFolderUri = `${booksDirUri}${folderName}/`;
      const folderInfo = await FileSystem.getInfoAsync(bookFolderUri);

      if (!folderInfo.isDirectory) continue;

      const pdfUri = `${bookFolderUri}doc.pdf`;
      const pdfInfo = await FileSystem.getInfoAsync(pdfUri);

      if (pdfInfo.exists && !pdfInfo.isDirectory) {
        const book: Book = {
          id: folderName,
          name: folderName,
          pdfUri: pdfUri,
        };

        const coverUri = `${bookFolderUri}cover.jpg`;
        const coverInfo = await FileSystem.getInfoAsync(coverUri);
        if (coverInfo.exists && !coverInfo.isDirectory) {
          book.coverUri = coverUri;
        }

        books.push(book);
      }
    }

    if (searchTerm && searchTerm.trim()) {
      const normalizedTerm = searchTerm.trim().toLowerCase();
      return books.filter((book) =>
        book.name.toLowerCase().includes(normalizedTerm)
      );
    }

    return books;
  } catch (error) {
    console.error("Erro ao ler o diretório dos livros:", error);
    return [];
  }
};

export const getBook = async (id: string): Promise<Book | undefined> => {
  const allBooks = await getBooks();
  return allBooks.find((book) => book.id === id);
};

// export const pickAndAddBook = async (): Promise<Book | null> => {
//   await ensureBooksDirectoryExists();

//   try {
//     const result = await DocumentPicker.getDocumentAsync({
//       type: "application/pdf",
//       copyToCacheDirectory: true,
//     });

//     // Caso o usuário cancele a ação
//     if (result.canceled || !result.assets?.[0]?.uri) {
//       return null;
//     }

//     const sourceUri = result.assets[0].uri;
//     const originalName = result.assets[0].name.replace(/\.pdf$/i, ""); // Limpa o nome do livro

//     const newBookFolderUri = `${booksDirUri}${originalName}/`;
//     const destinationPdfUri = `${newBookFolderUri}doc.pdf`;

//     await FileSystem.makeDirectoryAsync(newBookFolderUri, {
//       intermediates: true,
//     });

//     await FileSystem.copyAsync({
//       from: sourceUri,
//       to: destinationPdfUri,
//     });

//     const newBook: Book = {
//       id: originalName,
//       name: originalName,
//       pdfUri: destinationPdfUri,
//     };

//     console.log(`Livro adicionado: ${originalName}`);
//     return newBook;
//   } catch (error) {
//     console.error("Erro ao adicionar o livro:", error);
//     return null;
//   }
// };

export const pickAndAddBook = async (
  showModal: (onConfirm: (name: string, coverUri?: string) => void) => void
): Promise<Book | null> => {
  await ensureBooksDirectoryExists();

  return new Promise((resolve) => {
    // Open the modal (defined in your UI)
    showModal(async (bookName: string, coverUri?: string) => {
      if (!bookName.trim()) {
        Alert.alert("Nome Inválido", "Por favor, insira um nome válido.");
        return resolve(null);
      }

      const newBookFolderUri = `${booksDirUri}${bookName}/`;

      // Check if the book already exists
      const existing = await FileSystem.getInfoAsync(newBookFolderUri);
      if (existing.exists) {
        Alert.alert("Livro Duplicado", "Já existe um livro com este nome.");
        return resolve(null);
      }

      // Ask user to pick the PDF
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return resolve(null);
      }

      const sourcePdfUri = result.assets[0].uri;
      const destinationPdfUri = `${newBookFolderUri}doc.pdf`;

      await FileSystem.makeDirectoryAsync(newBookFolderUri, {
        intermediates: true,
      });
      await FileSystem.copyAsync({ from: sourcePdfUri, to: destinationPdfUri });

      // Copy cover if provided
      let finalCoverUri: string | undefined;
      if (coverUri) {
        const destinationCoverUri = `${newBookFolderUri}cover.jpg`;
        await FileSystem.copyAsync({ from: coverUri, to: destinationCoverUri });
        finalCoverUri = destinationCoverUri;
      }

      const newBook: Book = {
        id: bookName,
        name: bookName,
        pdfUri: destinationPdfUri,
        coverUri: finalCoverUri,
      };

      console.log(`Livro adicionado: ${bookName}`);
      resolve(newBook);
    });
  });
};

export const deleteBook = async (id: string): Promise<boolean> => {
  try {
    const bookFolderUri = `${booksDirUri}${id}/`;
    await FileSystem.deleteAsync(bookFolderUri, { idempotent: true });
    console.log(`Livro apagado: ${id}`);
    return true;
  } catch (error) {
    console.error(`Erro ao apagar o livro ${id}:`, error);
    return false;
  }
};
