Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = 'c:\Users\d79mo\Downloads\agendaerik\requerimientosdeproyecto.md.docx'
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xmlContent = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

$xmlDoc = [xml]$xmlContent
$ns = New-Object System.Xml.XmlNamespaceManager($xmlDoc.NameTable)
$ns.AddNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')
$paragraphs = $xmlDoc.SelectNodes('//w:p', $ns)
$lines = @()
foreach ($p in $paragraphs) {
    $runs = $p.SelectNodes('.//w:t', $ns)
    $lineText = ''
    foreach ($r in $runs) {
        $lineText += $r.InnerText
    }
    $lines += $lineText
}
$output = $lines -join "`n"
$output | Out-File -FilePath 'c:\Users\d79mo\Downloads\agendaerik\requerimientosdeproyecto.txt' -Encoding UTF8
Write-Host "Done extracting text"
