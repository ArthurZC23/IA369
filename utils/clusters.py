import argparse
import logging
import os

import numpy as np
import pandas as pd
from pandas import DataFrame
from pandas import Series
from scipy.spatial.distance import euclidean
from sklearn.cluster import KMeans


def set_logger():
    """Setup of stream log for quick debug"""

    logger = logging.getLogger('clusters')
    logger.setLevel(logging.DEBUG)
    sh = logging.StreamHandler()
    sh.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    sh.setFormatter(formatter)
    logger.addHandler(sh)

def new_assignement(lost_points, centers):
    """Assign new cluster to lost data points"""

    new_labels = np.apply_along_axis(
        lambda x: assign_label(x, centers),
        axis=1,
        arr=lost_points)
    return new_labels

def assign_label(x, centers):
    """Assign lable to X, based on cluster centers"""

    min = np.inf
    label = None
    for l, v in centers.items():
        dist = euclidean(x, v)
        if min > dist:
            min = dist
            label = l
    return l

def get_args():

    parser = argparse.ArgumentParser()
    parser.add_argument('--file', type=str, help='path to JSON crime data file')
    parser.add_argument('--clusters', type=int, help='number of clusters', default=10)
    args = parser.parse_args()
    file = args.file
    clusters = args.clusters
    return file, clusters

def filter_clusters(percentage, X, labels):
    """Filter out clusters with less than 0.1 of the tada"""
    labels_remove = []
    for l, v in percentage.items():
        if v < 0.05:
            idx = (labels == l)
            lost_p = X[idx]
            try:
                lost_points = np.concatenate((lost_points, lost_p), axis=0)
            except NameError:
                lost_points = lost_p
            labels_remove.append(l)
    return labels_remove, lost_points

def main():

    set_logger()
    logger = logging.getLogger('clusters.main')

    logger.info("Parsing arguments")
    file, clusters = get_args()

    logger.info("Performing KMeans clustering")
    df = pd.read_json(file)
    X = df.loc[:, ['lat', 'lng']].values
    kmeans = KMeans(n_clusters=clusters, max_iter=1000).fit(X)

    #Cluster metadata
    logger.info("Calculating cluster metadata")
    centers = {k: v for k, v in enumerate(kmeans.cluster_centers_)}
    logger.info("Counting number of crimes of each cluster")
    labels = Series(kmeans.labels_)
    num_labels = {}
    for l in labels.unique():
        num = labels[labels == l].count()
        num_labels[l] = num
    logger.debug("Number of occurrences of each label: {}".format(num_labels))

    logger.info("Transforming counting into percentage")
    total = labels.count()
    percentage = {k: v/total for k, v in num_labels.items()}
    logger.debug("Percentage of each label: {}".format(percentage))

    logger.info("Removing clusters with few points")
    labels_remove, lost_points = filter_clusters(percentage, X, labels)
    for l in labels_remove:
        percentage.pop(l, 'None')
        num_labels.pop(l, 'None')
        centers.pop(l, 'None')

    logger.debug("Number of occurrences of each label after filtering: {}".format(num_labels))
    logger.debug("Percentage of each label after filtering: {}".format(percentage))
    logger.debug("Number of filtered points: {}".format(lost_points.shape[0]))

    logger.info("Assign lost points to new clusters")
    new_labels = new_assignement(lost_points, centers)
    for l in new_labels:
        num_labels[l] += 1
    percentage = {k: v/total for k, v in num_labels.items()}

    logger.info("Save results in JSON")
    #Separate center into lat and lng
    centers_lat,  centers_lng= {}, {}
    print(centers)
    for k, v in centers.items():
        centers_lat[k], centers_lng[k] = v[0], v[1]
    columns = [
        'Number of crimes',
        'Percentage of total crimes',
        'lat',
        'lng'
        ]
    df_meta = DataFrame({
        columns[0]: num_labels,
        columns[1]: percentage,
        columns[2]: centers_lat,
        columns[3]: centers_lng
    })
    _, basename = os.path.split(file)
    basename, _ = os.path.splitext(basename)
    df_meta.to_json(
        path_or_buf=basename+'Cluster.json',
        orient='records'
    )

main()
