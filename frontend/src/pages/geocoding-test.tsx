/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import { testReverseGeocoding } from '@/utils/geocodingHelper'

const GeocodingTestPage: NextPage = () => {
  const [latitude, setLatitude] = useState('48.858268')
  const [longitude, setLongitude] = useState('2.294471')
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTest = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const lat = parseFloat(latitude)
      const lng = parseFloat(longitude)
      
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinates. Please enter valid numbers.')
      }
      
      const testResult = await testReverseGeocoding([lng, lat])
      setResult(testResult)
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10">
      <Head>
        <title>Reverse Geocoding Test</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Reverse Geocoding Test
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Latitude
              </label>
              <input
                id="latitude"
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md px-4 py-2 text-gray-900 dark:text-gray-100"
                placeholder="Latitude (e.g. 48.858268)"
              />
            </div>
            
            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Longitude
              </label>
              <input
                id="longitude"
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md px-4 py-2 text-gray-900 dark:text-gray-100"
                placeholder="Longitude (e.g. 2.294471)"
              />
            </div>
          </div>
          
          <div>
            <button
              onClick={handleTest}
              disabled={isLoading}
              className={`w-full py-3 rounded-md text-white font-medium ${
                isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Testing...' : 'Test Reverse Geocoding'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Geocoding Result
              </h3>
            </div>
            <div className="p-6 overflow-auto max-h-96">
              <pre className="text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GeocodingTestPage