
#!/bin/bash
#refseq is $2
#sequence is $1
source ~/.bashrc
sequence=$1
refseq=$2
id=$3
dir=./public/temp
echoerr() { echo "$@" 1>&2; }
echoerr "1"
bwa index $refseq
echoerr "2"
bwa bwasw $refseq $sequence > $id.aln.sam
echoerr "3"
samtools view -bS -F 4 $id.aln.sam > $id.aln.bam
echoerr "4"
samtools sort $id.aln.bam $id.aln.sort
echoerr "5"
samtools index $id.aln.sort.bam
echoerr "6"
genomeCoverageBed -ibam $id.aln.sort.bam -g $refseq -d > $id.coverageHist.txt
awk 'BEGIN {count=0} $3 != 0 {count += 1} END {print (count/NR)*100}' $id.coverageHist.txt > $id.coverage.txt
pwd
cat $id.coverageHist.txt | scripts/rplot.r $id.plot.png
