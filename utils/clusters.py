import argparse


import pandas as pd
from pandas import DataFrame
from sklearn.cluster import KMeans


def main():

    parser = argparse.ArgumentParser()
    parser.add_argument('--file', type=str, help='path to JSON crime data file')
    parser.add_argument('--clusters', type=int, help='number of clusters', default=10)
    args = parser.parse_args()
    file = args.file
    clusters = args.clusters

    df = pd.read_json(file)
    X = df.loc[:, ['lat', 'lng']].values
    kmeans = KMeans(n_clusters=clusters, max_iter=1000).fit(X)
    centers = kmeans.cluster_centers_
    columns = ['lat', 'lng']
    df_clusters = DataFrame(centers, columns=columns)
    df_clusters.to_json(
        path_or_buf=file+'Cluster.json',
        orient='records'
    )

main()
