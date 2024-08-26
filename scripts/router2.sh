#!/bin/bash

####################################
#                                  #
# 	  Export router2.txt           #
#                                  #
####################################

mkdir /tmp/pathvector-bgp-status/
pathvector s > /tmp/pathvector-bgp-status/router2.txt

sleep 2s

####################################
#				   #
# Convert router2.txt to router2.csv #
#				   #
####################################

# Define input and output files
input_file="router2.txt"
output_file="router2.csv"

# Create the CSV file with the header
echo "Peer,AS,Neighbor,State,IN,OUT,Since,Info" > "$output_file"

# Process the input file
awk '
BEGIN {
    # Set the field separator to whitespace
    FS="[ \t]+"
    OFS=","
}
NR > 1 {  # Skip the header row
    # Extract fields
    peer = $1
    as = $2
    neighbor = $3
    state = $4
    in_count = ($5 ~ /^[0-9]+$/) ? $5 : ""
    out_count = ($6 ~ /^[0-9]+$/) ? $6 : ""
    since = $7 " " $8
    info = ""
    
    # Concatenate remaining fields for info
    for (i = 9; i <= NF; i++) {
        if (info == "") {
            info = $i
        } else {
            info = info " " $i
        }
    }

    # Handle cases where 'IN' and 'OUT' are missing
    if (in_count == "" && out_count == "") {
        # Shift fields to the 'Since' and 'Info' positions
        since = $5 " " $6
        info = $7
    }

    # Print the CSV line without 'Type' column
    print peer, as, neighbor, state, in_count, out_count, since, info
}' "$input_file" >> "$output_file"


mv /tmp/pathvector-bgp-status/router2.csv /your_location
