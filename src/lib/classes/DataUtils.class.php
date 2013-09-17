<?php

/**
 * Utilities for operating on {@code double}-valued data. This class: <ul>
 * <li>should probably be enhanced to work with {@code Double}
 * {@code Collection}s</li> <li>could be renamed to DoubleUtils or something
 * funny like Dubbles</li> </p>
 * 
 * <p>See {@link Doubles}  minimum, maximum, sum,
 * mean, product, etc... of {@code double} arrays as well as other
 * properties</p>
 * 
 * <p>Transformations of {@code double} arrays or {@code List}s may be
 * performed on empty data sets; {@code null} data sets throw an exception.</p>
 * 
 * <p>Class designed to reduce data copying hence why List variants do not
 * call toArray() and delegate to varargs variant.</p>
 */
 
 	const MAX_SEQ_LEN = 10001;
 
 	/**
	 * Returns the difference between {@code test} and {@code target}, relative
	 * to {@code target}, as a percent. If {@code target} is 0, method returns 0
	 * if {@code test} is also 0, otherwise {@code Double.POSITIVE_INFINITY}. If
	 * either value is {@code Double.NaN}, method returns {@code Double.NaN}.
	 * @param test value
	 * @param target value
	 * @return the percent difference
	 */
	public static function getPercentDiff ($test, $target) {
		if (is_nan($target) || is_nan($test)) return NAN;
		if ($target == 0) return test == 0 ? 0 : INF;
		return abs($test - $target) / $target * 100;
	}

	/**
	 * Returns whether the supplied {@code data} are all positive.
	 * @param data to check
	 * @return {@code true} if all values are &ge;0
	 */
	public static function isPositive ($data) {
		for ($i = 0; $i < count($data); $i++) {
			if ($data[i] >= 0) continue;
			return false;
		}
		return true;
	}

	/**
	 * Returns whether the elements of the supplied {@code data} increase or
	 * decrease monotonically, with a flag indicating if duplicate elements are
	 * permitted. The {@code repeats} flag could be {@code false} if checking
	 * the x-values of a function for any steps, or {@code true} if checking the
	 * y-values of a cumulative distribution function, which are commonly
	 * constant.
	 * @param ascending if {@code true}, descending if {@code false}
	 * @param repeats whether repeated adjacent elements are allowed
	 * @param data to validate
	 * @return {@code true} if monotonic, {@code false} otherwise
	 */
	public static function isMonotonic ($ascending, $repeats, $data) {
		$diff = $this->diff($data);
		if (!$ascending) $this->flip($diff);
		$min = min($diff);
		return ($repeats) ? $min >= 0 : $min > 0;
	}

	/**
	 * Returns the difference of adjacent elements in the supplied {@code data}.
	 * Method returns results in a new array that has {@code data.length - 1}
	 * where differences are computed per {@code data[i+1] - data[i]}.
	 * @param data to difference
	 * @return the differences between adjacent values
	 */
	public static function diff ($data) {
		int size = data.length - 1;
		$diff = array();
		for ($i = 0; $i < count($data); $i++) {
			$diff[] = $data[$i + 1] - $data[$i];
		}
		return $diff;
	}
	
	/**
	 * Creates a sequence of values starting at {@code min} and ending at
	 * {@code max}, the log of which are evenly spaced.
	 * @param min sequence value
	 * @param max sequence value
	 * @param step sequence spacing
	 * @param ascending if {@code true}, descending if {@code false}
	 * @return a monotonically increasing or decreasing sequence where the log
	 *         of the values are evenly spaced
	 * @throws IllegalArgumentException if {@code min >= max}, {@code step <= 0}
	 *         , or any arguments are {@code Double.NaN},
	 *         {@code Double.POSITIVE_INFINITY}, or
	 *         {@code Double.NEGATIVE_INFINITY}
	 * 
	 */
	public static function buildLogSequence ($min, $max,
			$step, $ascending) {
		$seq = $this->buildSequence(log($min), log($max),
			log($step), $ascending);
		return $this->exp($seq);
	}

	/**
	 * Creates a sequence of evenly spaced values starting at {@code min} and
	 * ending at {@code max}. If {@code (max - min) / step} is not integer
	 * valued, the last step in the sequence will be {@code &lt;step}.
	 * @param min sequence value
	 * @param max sequence value
	 * @param step sequence spacing
	 * @param ascending if {@code true}, descending if {@code false}
	 * @return a monotonically increasing or decreasing sequence of values
	 * @throws IllegalArgumentException if {@code min >= max}, {@code step <= 0}
	 *         , or any arguments are {@code Double.NaN},
	 *         {@code Double.POSITIVE_INFINITY}, or
	 *         {@code Double.NEGATIVE_INFINITY}
	 */
	public static function buildSequence ($min, $max, $step, $ascending) {
		// if passed in arguments are NaN, +Inf, or -Inf, and step <= 0,
		// then capacity [c] will end up 0 because (int) NaN = 0, or outside the
		// range 1:10000
		$c = floor(($max - $min) / $step);
		if ($c < 1 || $c >= MAX_SEQ_LEN) {
			throw new Exception("RTGM: max sequence length reached");
		}		
		if ($ascending) return $this->makeSequence($min, $max, $step, $c + 2);
		$descSeq = $this->buildSequence(-$max, -$min, $step, $c + 2);
		return $this->flip($descSeq);
	}

	private static function makeSequence($min, $max, $step, $capacity) {
		$seq = array();
		for ($val = min; $val < $max; $val = $val + $step) {
			seq[] = val;
		}
		if (seq[count(seq) - 1)] != max) seq[] = $max;
		$seq;
	}	

	/**
	 * Scales (multiplies) the elements of the supplied {@code data} in place
	 * by {@code value}.
	 * 
	 * <p><b>Note:</b> This method does not check for over/underflow.</p>
	 * @param data to scale
	 * @param value to scale by
	 * @return a reference to the supplied data
	 */
	public static function scale($value, $data) {
		for ($i = 0; $i < count($data); $i++) {
			$data[$i] = $data[$i] * $value;
		}
		return $data;
	}

	/**
	 * Adds the {@code value} to the supplied {@code data} in place.
	 * 
	 * <p><b>Note:</b> This method does not check for over/underrun.</p>
	 * @param data to add to
	 * @param value to add
	 * @return a reference to the supplied data
	 */
	public static function add($value, $data) {
		for ($i = 0; $i < count($data); $i++) {
			$data[$i] = $data[$i] + $value;
		}
		return $data;
	}

	/**
	 * Adds the values of {@code data2} to {@code data1} and returns a reference
	 * to {@code data1}.
	 * @param data1 
	 * @param data2
	 * @return a reference to {@code data1}
	 */
	public static function add($data1, $data2) {
		for ($i=0; $i < count($data1); $i++) {
			$data1[$i] = $data1[$i] + data2[$i];
		}
		return $data1;
	}

	/**
	 * Subtracts the values of {@code data2} from {@code data1} and returns a
	 * reference to {@code data1}.
	 * @param data1
	 * @param data2
	 * @return a reference to {@code data1}
	 */
	public static function subtract(double[] data1, double[] data2) {
		for ($i=0; $i < count($data1); $i++) {
			$data1[$i] = $data1[$i] - data2[$i];
		}
		return $data1;
	}

	/**
	 * Nultiples the values of {@code data1} to {@code data2} and returns a
	 * reference to {@code data1}.
	 * @param data1
	 * @param data2
	 * @return a reference to {@code data1}
	 */
	public static function multiply($data1, $data2) {
		for ($i=0; $i < count($data1); $i++) {
			$data1[$i] = $data1[$i] * data2[$i];
		}
		return data1;
	}

	/**
	 * Sets every element of the supplied {@code data} to its absolute value.
	 * @param data to operate on
	 * @return a reference to the data
	 */
	public static function abs(double... data) {
		for ($i=0; $i < count($data1); $i++) {
			$data1[$i] = abs($data1[$i]);
		}
		return data1;
	}
	
	/**
	 * Applies the exponential function to every element of the supplied 
	 * {@code data}.
	 * 
	 * <p><b>Note:</b> This method does not check for over/underflow.</p>
	 * @param data to operate on
	 * @return a reference to the data
	 */
	public static double[] exp(double... data) {
		return transform(EXP, data);
	}

	/**
	 * Applies the natural log function to every element of the supplied 
	 * {@code data}.
	 * 
	 * @param data to operate on
	 * @return a reference to the data
	 */
	public static double[] ln(double... data) {
		return transform(LN, data);
	}

	/**
	 * Applies the base-10 log function to every element of the supplied 
	 * {@code data}.
	 * 
	 * @param data to operate on
	 * @return a reference to the data
	 */
	public static double[] log(double... data) {
		return transform(LOG, data);
	}

	/**
	 * Flips the sign of every element in the supplied {@code data}.
	 * @param data to operate on
	 * @return a reference to the data
	 */
	public static double[] flip(double... data) {
		return transform(new Scale(-1), data);
	}
	
	/**
	 * Returns the minimum of the supplied values. Method delegates to
	 * {@link Doubles#min(double...)}. Method returns {@code Double.NaN} if
	 * {@code data} contains {@code Double.NaN}.
	 * 
	 * @param data array to search
	 * @return the minimum of the supplied values
	 * @throws IllegalArgumentException if {@code data} is empty
	 * @see Doubles#min(double...)
	 */
	public static double min(double... data) {
		return Doubles.min(data);
	}
	
	/**
	 * Returns the maximum of the supplied values. Method delegates to
	 * {@link Doubles#max(double...)}. Method returns {@code Double.NaN} if
	 * {@code data} contains {@code Double.NaN}.
	 * 
	 * @param data array to search
	 * @return the maximum of the supplied values
	 * @throws IllegalArgumentException if {@code data} is empty
	 * @see Doubles#max(double...)
	 */
	public static double max(double... data) {
		return Doubles.max(data);
	}

	/**
	 * Returns the sum of the supplied values. Method returns {@code Double.NaN}
	 * if {@code data} contains {@code Double.NaN}.
	 * 
	 * <p><b>Note:</b> This method does not check for over/underflow.</p>
	 * @param data to add together
	 * @return the sum of the supplied values
	 */
	public static double sum(double... data) {
		checkNotNull(data);
		double sum = 0;
		for (double d : data) {
			sum += d;
		}
		return sum;
	}
	
	/**
	 * Returns the sum of the supplied values. Method returns {@code Double.NaN}
	 * if {@code data} contains {@code Double.NaN}.
	 * 
	 * <p><b>Note:</b> This method does not check for over/underflow.</p>
	 * @param data to add together
	 * @return the sum of the supplied values
	 */
	public static double sum(List<Double> data) {
		checkNotNull(data);
		double sum = 0;
		for (double d : data) {
			sum += d;
		}
		return sum;
	}


	/**
	 * Converts the elements of {@code data} to weights, in place, such that
	 * they sum to 1.
	 * @param data to convert
	 * @return a reference to the supplied array
	 * @throws IllegalArgumentException if {@code data} is empty, contains any
	 *         {@code Double.NaN} or negative values, or sums to a value outside
	 *         the range {@code (0..Double.POSITIVE_INFINITY)}
	 */
	public static double[] asWeights(double... data) {
		checkArgument(isPositive(data));
		double sum = sum(data);
		checkArgument(POS_RANGE.contains(sum));
		double scale = 1d / sum;
		return scale(scale, data);
	}

	/**
	 * Converts the elements of {@code data} to weights, in place, such that
	 * they sum to 1.
	 * @param data to convert
	 * @return a reference to the supplied array
	 * @throws IllegalArgumentException if {@code data} is empty, contains any
	 *         {@code Double.NaN} or negative values, or sums to a value outside
	 *         the range {@code (0..Double.POSITIVE_INFINITY)}
	 */
	public static List<Double> asWeights(List<Double> data) {
		checkArgument(isPositive(data));
		double sum = sum(data);
		checkArgument(POS_RANGE.contains(sum));
		double scale = 1d / sum;
		return scale(scale, data);
	}

	/**
	 * Transforms the supplied {@code data} in place as per the supplied
	 * {@code function}'s {@link Function#apply(Object)} method.
	 * @param function to apply to data elements
	 * @param data to operate on
	 * @return a reference to the supplied {@code data} array
	 */
	private static double[] transform(Function<Double, Double> function,
			double... data) {
		checkNotNull(data);
		for (int i = 0; i < data.length; i++) {
			data[i] = function.apply(data[i]);
		}
		return data;
	}	
	
	/**
	 * Validates the domain of a {@code double} data set. Method verifies
	 * that data values all fall between {@code min} and {@code max} range
	 * (inclusive). Empty arrays are ignored. If {@code min} is
	 * {@code Double.NaN}, no lower limit is imposed; the same holds true
	 * for {@code max}. {@code Double.NaN} values in {@code array}
	 * will validate.
	 * 
	 * @param min minimum range value
	 * @param max maximum range value
	 * @param array to validate
	 * @throws IllegalArgumentException if {@code min > max}
	 * @throws IllegalArgumentException if any {@code array} value is out of
	 *         range
	 */
	public static function validate(double min, double max, double... array) {
		checkNotNull(array, "array");
		for (int i = 0; i < array.length; i++) {
			validate(min, max, array[i]);
		}
	}
		
	/**
	 * Verifies that a {@code double} data value falls within a specified
	 * minimum and maximum range (inclusive). If {@code min} is 
	 * {@code Double.NaN}, no lower limit is imposed; the same holds true
	 * for {@code max}. A value of {@code Double.NaN} will always
	 * validate.
	 * 
	 * @param min minimum range value
	 * @param max minimum range value
	 * @param value to check
	 * @throws IllegalArgumentException if {@code min > max}
	 * @throws IllegalArgumentException if value is out of range
	 */
	public final static function validate(double min, double max, double value) {
		boolean valNaN = isNaN(value);
		boolean minNaN = isNaN(min);
		boolean maxNaN = isNaN(max);
		boolean both = minNaN && maxNaN;
		boolean neither = !(minNaN || maxNaN);
		if (neither) checkArgument(min <= max, "min-max reversed");
		boolean expression = valNaN || both ? true : minNaN
			? value <= max : maxNaN ? value >= min : value >= min &&
				value <= max;
		checkArgument(expression, "value");
	}
	
	/**
	 * Creates a new array from the values in a source array at the specified
	 * indices. Returned array is of same type as source.
	 * 
	 * @param array array source
	 * @param indices index values of items to select
	 * @return a new array of values at indices in source
	 * @throws NullPointerException if {@code array} or
	 *         {@code indices} are {@code null}
	 * @throws IllegalArgumentException if data object is not an array or if
	 *         data array is empty
	 * @throws IndexOutOfBoundsException if any indices are out of range
	 */
	public static Object arraySelect(Object array, int[] indices) {
		checkNotNull(array, "Supplied data array is null");
		checkNotNull(indices, "Supplied index array is null");
		checkArgument(array.getClass().isArray(),
			"Data object supplied is not an array");
		int arraySize = Array.getLength(array);
		checkArgument(arraySize != 0, "Supplied data array is empty");

		// validate indices
		for (int i = 0; i < indices.length; i++) {
			checkPositionIndex(indices[i], arraySize, "Supplied index");
		}

		Class<? extends Object> srcClass = array.getClass().getComponentType();
		Object out = Array.newInstance(srcClass, indices.length);
		for (int i = 0; i < indices.length; i++) {
			Array.set(out, i, Array.get(array, indices[i]));
		}
		return out;
	}

	/**
	 * Sorts the supplied data array in place and returns an {@code int[]}
	 * array of the original indices of the data values. For example, if the
	 * supplied array is [3, 1, 8], the supplied array will be sorted to [1, 3,
	 * 8] and the array [2, 1, 3] will be returned.
	 * 
	 * @param data array to sort
	 * @return the inidices of the unsorted array values
	 * @throws NullPointerException if source array is {@code null}
	 */
	@Deprecated
	public static int[] indexAndSort(final double[] data) {
		checkNotNull(data, "Source array is null");
		List<Integer> indices = Ints.asList(new int[data.length]);
		for (int i = 0; i < indices.size(); i++) {
			indices.set(i, i);
		}
		Collections.sort(indices, new Comparator<Integer>() {
			@Override
			public int compare(Integer i1, Integer i2) {
				double d1 = data[i1];
				double d2 = data[i2];
				return (d1 < d2) ? -1 : (d1 == d2) ? 0 : 1;
			}
		});
		Arrays.sort(data);
		return Ints.toArray(indices);
	}
	
	/**
	 * Returns an index {@code List} that provides a pointers to sorted
	 * {@code data}. Let's say you have a number of {@code List<Double>}s and
	 * want to sort them all according to one of your choosing. Supply this
	 * method with the desired {@code data} and use the returned indices view
	 * any of your arrays according to the sort order of the supplied
	 * {@code data}.
	 * 
	 * <p> <b>Notes:</b> <ul> <li>The supplied data should not be sorted</li>
	 * <li>This method does not modify the supplied {@code data} in any way</li>
	 * <li>Any {@code NaN}s in {@code data} are placed at the start of the sort
	 * order, regardless of sort direction</li> <ul> </p>
	 * 
	 * @param data to provide sort indices for
	 * @param ascending if {@code true}, descending if {@code false}
	 * @return an index {@code List}
	 */
	public static List<Integer> sortedIndices(List<Double> data,
			boolean ascending) {
		checkNotNull(data);
		List<Integer> indices = Ints.asList(indices(data.size()));
		Collections.sort(indices, new IndexComparator(data, ascending));
		return indices;
	}
	
	/*
	 * A comparator for ascending sorting of an index array based on the
	 * supplied double array of data.
	 */
	private static class IndexComparator implements Comparator<Integer> {
		List<Double> data;
		boolean ascending;
		IndexComparator(List<Double> data, boolean ascending) {
			this.data = data;
			this.ascending = ascending;
		}
		@Override
		public int compare(Integer i1, Integer i2) {
			double d1 = data.get(ascending ? i1 : i2);
			double d2 = data.get(ascending ? i2 : i1);
			return (d1 < d2) ? -1 : (d1 == d2) ? 0 : 1;
		}
	}
	
	/**
	 * Returns an {@code int[]} of values ascending from {@code 0} to
	 * {@code 1-length} that can be used for sorting.
	 * @param length
	 * @return an index array
	 * @see DataUtils#sortedIndices(List, boolean)
	 */
	public static function indices(int length) {
		int[] indices = new int[length];
		for (int i = 0; i < indices.length; i++) {
			indices[i] = i;
		}
		return indices;
	}

    /**
     * Creates an array of random {@code double} values.
     * @param length of output array
     * @return the array of random {@code double}s
     */
    public static function randomValues(int length) {
    	Random random = new Random();
        double[] values = new double[length];
        for (int i=0; i<length; i++) {
        	values[i] = random.nextDouble();
        }
        return values;
    }
    
    /**
     * Returns the index of the minimum value in {@code data}.
     * @param data
     * @return the index of the minimum value
     */
    public static function minIndex(double... data) {
        int idx = -1;
        double d = Double.POSITIVE_INFINITY;
        for(int i = 0; i < data.length; i++)
            if(data[i] < d) {
                d = data[i];
                idx = i;
            }
        return idx;
    }

    /**
     * Returns the index of the maximum value in {@code data}.
     * @param data
     * @return the index of the maximum value
     */
    public static function maxIndex(double... data) {
        int idx = -1;
        double d = Double.NEGATIVE_INFINITY;
        for(int i = 0; i < data.length; i++)
            if(data[i] > d) {
                d = data[i];
                idx = i;
            }
        return idx;
    }

}

?>
