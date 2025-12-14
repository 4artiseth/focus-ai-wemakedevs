$file = "src/components/insights/PricingLiveDashboard.tsx"
$content = Get-Content $file -Raw

# Replace the SVG with AcceptanceCurve component
$pattern = '(?s)<svg className="absolute inset-0 w-full h-full.*?</svg>'
$replacement = '<AcceptanceCurve data={{ tooCheap: psmMedians.tooCheap || 0, bargain: psmMedians.bargain || 0, expensive: psmMedians.expensive || 0, tooExpensive: psmMedians.tooExpensive || 0 }} currency={currency} theme="dark" />'

$content = $content -replace $pattern, $replacement

Set-Content $file $content -NoNewline

Write-Host "Chart replaced successfully!"
