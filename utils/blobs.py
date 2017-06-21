import argparse
import os

import pandas as pd


def main():

    parser = argparse.ArgumentParser()
    parser.add_argument('--file', type=str, help='path to JSON crime data file')
    parser.add_argument('--chunks', type=int, help='number of JSON blobs after splitting the original one')
    args = parser.parse_args()
    file = args.file
    chunks = args.chunks

    df = pd.read_json(file)
    rows = df.shape[0]
    _, new_file = os.path.split(file)
    new_file, _ = os.path.splitext(new_file)
    for i in range(chunks):
        blob = df.loc[i*rows/chunks:(i+1)*rows/chunks, :]
        blob.to_json(
            path_or_buf=new_file+str(i)+'.json',
            orient='records'
        )
if __name__ == '__main__':
    main()
