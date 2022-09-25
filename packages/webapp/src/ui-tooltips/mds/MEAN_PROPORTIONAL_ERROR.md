Each aggregated combination can be organized into buckets based on their counts. For example, the bucket 10 contains the combinations that have counts from `(0, 10]`, the bucket 20 from `(10, 20]`, and so on. The bucket number therefore communicates the upper bound of the range.

For every bucket, the mean proportional error can be computed as the mean of:

```
if sensitive_count > 0 {
	|synthetic_count - sensitive_count| /
		sensitive_count
} else {
	1.0
}
```

The average of the mean proportional error for all buckets defines the overall mean proportional error.

The closer this is to 0, the closer the aggregate/synthetic counts are from the sensitive counts for each bucket (see the chart below).
