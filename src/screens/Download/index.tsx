import { useState } from "react";
import { View, Text, Alert, Platform } from "react-native";

import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import { styles } from "./styles";
import { Button } from "../../components/Button";

const PDF_URI = {
  SAMPLE: "https://www.thecampusqdl.com/uploads/files/pdf_sample_2.pdf",
  FLORI: "https://www.mcfadden.com.br/assets/pdf/Flofi.pdf",
};

const PDF_NAME = "doc.pdf";

export function Download() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [percentageProgress, setPercentageProgess] = useState(0);

  function onDownloadProgress({
    totalBytesWritten,
    totalBytesExpectedToWrite,
  }: FileSystem.DownloadProgressData) {
    const percentage = (totalBytesWritten / totalBytesExpectedToWrite) * 100;
    setPercentageProgess(percentage);
  }

  async function handleDownload() {
    try {
      setIsDownloading(true);

      const fileUri = FileSystem.documentDirectory + PDF_NAME;
      const downloadResumable = FileSystem.createDownloadResumable(
        PDF_URI.FLORI,
        fileUri,
        {},
        onDownloadProgress
      );

      const downloadResponse = await downloadResumable.downloadAsync();

      if (downloadResponse?.uri) {
        await fileSave(downloadResponse.uri, PDF_NAME);
        setIsDownloading(false);
        setPercentageProgess(0);
      }
    } catch (error) {
      Alert.alert("Download", "Não foi possível fazer o download.");

      console.log(error);
    }
  }

  async function fileSave(uri: string, filename: string) {
    if (Platform.OS === "android") {
      const directoryUri = FileSystem.documentDirectory + filename;

      const base64File = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await FileSystem.writeAsStringAsync(directoryUri, base64File, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(directoryUri);
    } else {
      Sharing.shareAsync(uri);
    }
  }

  return (
    <View style={styles.container}>
      <Button
        title="Download PDF"
        onPress={handleDownload}
        isLoading={isDownloading}
      />
      {percentageProgress > 0 && (
        <Text style={styles.progress}>{percentageProgress.toFixed(1)}%</Text>
      )}
    </View>
  );
}
