import { showUI, on, emit } from '@create-figma-plugin/utilities'
import { TIER_LIMITS, getResizeLimit, getTierInfo } from './stripe-products'

// ============================================================================
// FREEMIUM TIER CONSTANTS (derived from Stripe products)
// ============================================================================

// Get limits from tier configuration
const FREE_ONE_TIME_LIMIT = TIER_LIMITS.free.limit
const BASIC_DAILY_LIMIT = TIER_LIMITS.basic.limit
const PRO_DAILY_LIMIT = TIER_LIMITS.pro.limit

// Storage keys for tracking usage
const STORAGE_KEYS = {
  FREE_USED: 'free_used_count',
  BASIC_TODAY: 'basic_used_today',
  BASIC_DATE: 'basic_date',
  PRO_TODAY: 'pro_used_today',
  PRO_DATE: 'pro_date',
  CURRENT_PLAN: 'current_plan'
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get today's date as YYYY-MM-DD for comparison
 */
function getTodayDate(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

/**
 * Get the current user's subscription plan from Figma's payment API
 */
async function getCurrentPlan(): Promise<'free' | 'basic' | 'pro'> {
  try {
    // Check if user has any paid plans
    // Note: figma.payments API integration requires Figma plugin with payments permission
    if (!figma.payments) {
      return 'free'
    }

    // For now, we'll use clientStorage to track the current plan
    // In production, this would check figma.payments.userPayments
    const storedPlan = await figma.clientStorage.getAsync(STORAGE_KEYS.CURRENT_PLAN)

    if (storedPlan === 'basic' || storedPlan === 'pro') {
      return storedPlan as 'basic' | 'pro'
    }

    return 'free'
  } catch (error) {
    // If there's an error accessing payments, default to free
    console.error('Error checking payment status:', error)
    return 'free'
  }
}

/**
 * Get remaining uses for the current plan
 */
async function getRemainingUses(): Promise<{ plan: 'free' | 'basic' | 'pro'; remaining: number; limit: number; resetTime?: string }> {
  const currentPlan = await getCurrentPlan()
  const today = getTodayDate()

  if (currentPlan === 'free') {
    const freeUsed = parseInt(await figma.clientStorage.getAsync(STORAGE_KEYS.FREE_USED) || '0')
    return {
      plan: 'free',
      remaining: Math.max(0, FREE_ONE_TIME_LIMIT - freeUsed),
      limit: FREE_ONE_TIME_LIMIT
    }
  }

  if (currentPlan === 'basic') {
    const basicDate = await figma.clientStorage.getAsync(STORAGE_KEYS.BASIC_DATE)
    const basicToday = parseInt(await figma.clientStorage.getAsync(STORAGE_KEYS.BASIC_TODAY) || '0')

    // Reset counter if it's a new day
    if (basicDate !== today) {
      await figma.clientStorage.setAsync(STORAGE_KEYS.BASIC_TODAY, '0')
      await figma.clientStorage.setAsync(STORAGE_KEYS.BASIC_DATE, today)
      return {
        plan: 'basic',
        remaining: BASIC_DAILY_LIMIT,
        limit: BASIC_DAILY_LIMIT,
        resetTime: 'tomorrow at midnight'
      }
    }

    return {
      plan: 'basic',
      remaining: Math.max(0, BASIC_DAILY_LIMIT - basicToday),
      limit: BASIC_DAILY_LIMIT,
      resetTime: 'tomorrow at midnight'
    }
  }

  if (currentPlan === 'pro') {
    const proDate = await figma.clientStorage.getAsync(STORAGE_KEYS.PRO_DATE)
    const proToday = parseInt(await figma.clientStorage.getAsync(STORAGE_KEYS.PRO_TODAY) || '0')

    // Reset counter if it's a new day
    if (proDate !== today) {
      await figma.clientStorage.setAsync(STORAGE_KEYS.PRO_TODAY, '0')
      await figma.clientStorage.setAsync(STORAGE_KEYS.PRO_DATE, today)
      return {
        plan: 'pro',
        remaining: PRO_DAILY_LIMIT,
        limit: PRO_DAILY_LIMIT,
        resetTime: 'tomorrow at midnight'
      }
    }

    return {
      plan: 'pro',
      remaining: Math.max(0, PRO_DAILY_LIMIT - proToday),
      limit: PRO_DAILY_LIMIT,
      resetTime: 'tomorrow at midnight'
    }
  }

  return { plan: 'free', remaining: 0, limit: 0 }
}

/**
 * Get tier information including pricing from Stripe products
 * This is called by the UI to display pricing information
 */
async function getTierDetails(plan: 'free' | 'basic' | 'pro'): Promise<{
  displayName: string
  limit: number
  isDaily: boolean
  monthlyPrice: number
  stripeProductId: string | null
  stripePriceId: string | null
}> {
  // No fallback - only return data from Stripe
  const tierInfo = await getTierInfo(plan)
  return {
    displayName: tierInfo.displayName,
    limit: tierInfo.limit,
    isDaily: tierInfo.isDaily,
    monthlyPrice: tierInfo.monthlyPrice,
    stripeProductId: tierInfo.stripeProductId,
    stripePriceId: tierInfo.stripePriceId
  }
}

/**
 * Increment usage counter for the current plan
 */
async function incrementUsage(): Promise<void> {
  const currentPlan = await getCurrentPlan()
  const today = getTodayDate()

  if (currentPlan === 'free') {
    const freeUsed = parseInt(await figma.clientStorage.getAsync(STORAGE_KEYS.FREE_USED) || '0')
    await figma.clientStorage.setAsync(STORAGE_KEYS.FREE_USED, (freeUsed + 1).toString())
  } else if (currentPlan === 'basic') {
    const basicDate = await figma.clientStorage.getAsync(STORAGE_KEYS.BASIC_DATE)
    const basicToday = parseInt(await figma.clientStorage.getAsync(STORAGE_KEYS.BASIC_TODAY) || '0')

    if (basicDate !== today) {
      // New day, reset counter
      await figma.clientStorage.setAsync(STORAGE_KEYS.BASIC_TODAY, '1')
      await figma.clientStorage.setAsync(STORAGE_KEYS.BASIC_DATE, today)
    } else {
      // Same day, increment
      await figma.clientStorage.setAsync(STORAGE_KEYS.BASIC_TODAY, (basicToday + 1).toString())
    }
  } else if (currentPlan === 'pro') {
    const proDate = await figma.clientStorage.getAsync(STORAGE_KEYS.PRO_DATE)
    const proToday = parseInt(await figma.clientStorage.getAsync(STORAGE_KEYS.PRO_TODAY) || '0')

    if (proDate !== today) {
      // New day, reset counter
      await figma.clientStorage.setAsync(STORAGE_KEYS.PRO_TODAY, '1')
      await figma.clientStorage.setAsync(STORAGE_KEYS.PRO_DATE, today)
    } else {
      // Same day, increment
      await figma.clientStorage.setAsync(STORAGE_KEYS.PRO_TODAY, (proToday + 1).toString())
    }
  }
}

/**
 * Find image node inside a frame/component
 */
function findImageNode(node: SceneNode): SceneNode | null {
  if ('fills' in node && Array.isArray(node.fills)) {
    const fills = node.fills as readonly Paint[]
    if (fills.some((p: Paint) => p.type === 'IMAGE')) {
      return node
    }
  }

  if (('children' in node) && (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'COMPONENT_SET' || node.type === 'GROUP')) {
    for (const child of node.children) {
      const found = findImageNode(child)
      if (found) return found
    }
  }

  return null
}

/**
 * Perform resize operation on a node
 */
function performResize(node: SceneNode, width: number, height: number, preserveAspectRatio: boolean): { width: number; height: number } {
  const originalWidth = 'width' in node ? node.width : 0
  const originalHeight = 'height' in node ? node.height : 0

  if (originalWidth === 0 || originalHeight === 0) {
    throw new Error('Invalid node dimensions')
  }

  const imageNode = findImageNode(node)

  let finalWidth = width
  let finalHeight = height

  // Preserve aspect ratio if requested
  if (preserveAspectRatio) {
    const aspectRatio = originalWidth / originalHeight
    if (width / height > aspectRatio) {
      finalWidth = height * aspectRatio
    } else {
      finalHeight = width / aspectRatio
    }
  }

  // Resize the frame/container
  if ('resize' in node && typeof node.resize === 'function') {
    node.resize(finalWidth, finalHeight)
  } else {
    // Fallback: try to cast and call resize anyway
    try {
      (node as any).resize(finalWidth, finalHeight)
    } catch (e) {
      throw new Error('Node cannot be resized. Please select a frame, component, or image.')
    }
  }

  // If there's an image inside, resize it too
  if (imageNode && 'resize' in imageNode) {
    const imageOriginalWidth = 'width' in imageNode ? imageNode.width : originalWidth
    const imageOriginalHeight = 'height' in imageNode ? imageNode.height : originalHeight

    if (imageOriginalWidth > 0 && imageOriginalHeight > 0) {
      const scaleX = finalWidth / originalWidth
      const scaleY = finalHeight / originalHeight
      const scale = Math.min(scaleX, scaleY)

      const newImageWidth = imageOriginalWidth * scale
      const newImageHeight = imageOriginalHeight * scale

      imageNode.resize(newImageWidth, newImageHeight)

      if ('x' in imageNode && 'y' in imageNode) {
        imageNode.x = (finalWidth - newImageWidth) / 2
        imageNode.y = (finalHeight - newImageHeight) / 2
      }
    }
  }

  return { width: finalWidth, height: finalHeight }
}

// ============================================================================
// PLUGIN INITIALIZATION
// ============================================================================

const initializePlugin = (): void => {
  showUI({
    height: 600,
    width: 360
  })
}

export default initializePlugin

// Listen for selection changes on the main thread
figma.on('selectionchange', async () => {
  // Notify UI that selection changed by emitting selection info immediately
  try {
    const selection = figma.currentPage.selection
    if (selection.length === 0) {
      emit('SELECTION_INFO', { hasSelection: false })
      return
    }

    const node = selection[0]
    if ('width' in node && 'height' in node) {
      const usageInfo = await getRemainingUses()
      emit('SELECTION_INFO', {
        hasSelection: true,
        width: (node as any).width,
        height: (node as any).height,
        name: (node as any).name,
        ...usageInfo
      })
    } else {
      emit('SELECTION_INFO', { hasSelection: false })
    }
  } catch (error) {
    console.error('Error in selectionchange handler:', error)
    emit('SELECTION_INFO', { hasSelection: false })
  }
})

// ============================================================================
// MESSAGE HANDLERS
// ============================================================================

/**
 * Handle resize request with usage limit enforcement
 */
on('RESIZE_IMAGE', async ({ width, height, preserveAspectRatio }: { width: number; height: number; preserveAspectRatio: boolean }) => {
  try {
    const selection = figma.currentPage.selection

    if (selection.length === 0) {
      figma.notify('Please select an image or frame containing an image.')
      emit('RESIZE_ERROR', { message: 'No selection found' })
      return
    }

    // Check usage limits
    const usageInfo = await getRemainingUses()

    if (usageInfo.remaining <= 0) {
      figma.notify(`You've reached your ${usageInfo.plan} tier limit. Upgrade your plan to continue.`)
      emit('RESIZE_ERROR', { message: 'Usage limit exceeded', tier: usageInfo.plan })
      return
    }

    const node = selection[0]

    // Check if node has required properties for resizing
    if (!('width' in node && 'height' in node)) {
      figma.notify('Selected node does not have width/height properties.')
      emit('RESIZE_ERROR', { message: 'Node cannot be resized' })
      return
    }

    // Perform the resize
    const result = performResize(node, width, height, preserveAspectRatio)

    // Increment usage counter
    await incrementUsage()

    // Get updated usage info
    const updatedUsage = await getRemainingUses()

    figma.notify(`Resized to ${Math.round(result.width)}×${Math.round(result.height)}`)
    emit('RESIZE_SUCCESS', {
      width: result.width,
      height: result.height,
      remaining: updatedUsage.remaining,
      plan: updatedUsage.plan
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    figma.notify(`Error: ${errorMessage}`)
    emit('RESIZE_ERROR', { message: errorMessage })
  }
})

/**
 * Get current selection and usage info
 */
on('GET_SELECTION', async () => {
  try {
    const selection = figma.currentPage.selection
    console.log('GET_SELECTION called, selection count:', selection.length)

    if (selection.length === 0) {
      console.log('No selection found')
      emit('SELECTION_INFO', { hasSelection: false })
      return
    }

    const node = selection[0]

    // Log for debugging
    console.log('Selected node type:', (node as any).type)
    console.log('Node object:', node)
    console.log('Has width:', 'width' in node)
    console.log('Has height:', 'height' in node)

    if ('width' in node && 'height' in node) {
      const usageInfo = await getRemainingUses()
      const selectionData = {
        hasSelection: true,
        width: (node as any).width,
        height: (node as any).height,
        name: (node as any).name,
        ...usageInfo
      }
      console.log('Emitting selection data:', selectionData)
      emit('SELECTION_INFO', selectionData)
    } else {
      // Still report selection even if dimensions missing, for debugging
      console.warn('Selected node missing width/height:', 'type' in node ? (node as any).type : 'unknown')
      emit('SELECTION_INFO', { hasSelection: false })
    }
  } catch (error) {
    console.error('Error in GET_SELECTION:', error)
    emit('SELECTION_INFO', { hasSelection: false })
  }
})

/**
 * Trigger payment checkout flow
 * Note: figma.clientStorage is a built-in API (no permission required)
 */
on('OPEN_PAYMENT', async ({ planId }: { planId: 'basic' | 'pro' }) => {
  try {
    // Store the plan selection in clientStorage (built-in, no permission needed)
    // In production, this would integrate with figma.payments.requestPayment()
    await figma.clientStorage.setAsync(STORAGE_KEYS.CURRENT_PLAN, planId)

    // Reset the daily counter for the new plan
    const today = getTodayDate()
    if (planId === 'basic') {
      await figma.clientStorage.setAsync(STORAGE_KEYS.BASIC_TODAY, '0')
      await figma.clientStorage.setAsync(STORAGE_KEYS.BASIC_DATE, today)
    } else if (planId === 'pro') {
      await figma.clientStorage.setAsync(STORAGE_KEYS.PRO_TODAY, '0')
      await figma.clientStorage.setAsync(STORAGE_KEYS.PRO_DATE, today)
    }

    figma.notify(`Plan updated to ${planId === 'basic' ? 'Basic' : 'Pro'}!`)

    // Refresh usage info after payment
    const usageInfo = await getRemainingUses()
    emit('PAYMENT_COMPLETE', usageInfo)
  } catch (error) {
    console.error('Payment error:', error)
    emit('PAYMENT_ERROR', { message: error instanceof Error ? error.message : 'Payment failed' })
  }
})

/**
 * Resize multiple variants at once
 */
on('RESIZE_BATCH', async ({ variants }: { variants: Array<{ width: number; height: number; name: string }> }) => {
  try {
    const selection = figma.currentPage.selection

    if (selection.length === 0) {
      emit('RESIZE_ERROR', { message: 'No selection found' })
      return
    }

    // Check if we have enough remaining uses
    const usageInfo = await getRemainingUses()
    if (usageInfo.remaining < variants.length) {
      figma.notify(`You only have ${usageInfo.remaining} resize(s) remaining. Need ${variants.length}.`)
      emit('RESIZE_ERROR', { message: 'Insufficient uses remaining' })
      return
    }

    const node = selection[0]
    
    // Check if node can be resized
    if (!('width' in node && 'height' in node && 'resize' in node)) {
      figma.notify('Selected node cannot be resized. Please select a frame, component, or image.')
      emit('RESIZE_ERROR', { message: 'Node cannot be resized' })
      return
    }

    // Get original node position and dimensions for positioning duplicates
    const originalX = 'x' in node ? node.x : 0
    const originalY = 'y' in node ? node.y : 0
    const originalWidth = 'width' in node ? node.width : 0
    const spacing = 20 // Spacing between duplicates in pixels
    
    // Calculate starting position (to the right of original)
    let currentX = originalX + originalWidth + spacing
    const currentY = originalY // Keep same Y position

    const resizedVariants = []

    for (const variant of variants) {
      let copy: SceneNode
      
      // Try to duplicate the node
      try {
        // Try duplicate() first (works for most node types)
        try {
          copy = (node as any).duplicate() as SceneNode
        } catch (duplicateError) {
          // If duplicate() fails, try clone() as fallback
          try {
            copy = (node as any).clone() as SceneNode
          } catch (cloneError) {
            // If both fail, the node type doesn't support duplication
            throw new Error('Node does not support duplication. Please select a frame, component, or group.')
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Cannot duplicate selected node'
        figma.notify(errorMessage)
        emit('RESIZE_ERROR', { message: 'Node cannot be duplicated' })
        return
      }

      // Set the name if possible
      if ('name' in copy) {
        copy.name = variant.name
      }

      try {
        // Resize the copy
        const result = performResize(copy, variant.width, variant.height, true)
        
        // Position the copy to the right of the previous one
        if ('x' in copy && 'y' in copy) {
          copy.x = currentX
          copy.y = currentY
          // Update currentX for the next duplicate (current position + width + spacing)
          currentX += result.width + spacing
        }
        
        resizedVariants.push({
          name: variant.name,
          width: result.width,
          height: result.height
        })
        await incrementUsage()
      } catch (error) {
        // Clean up the copy if resize failed
        try {
          if ('remove' in copy && typeof (copy as any).remove === 'function') {
            (copy as any).remove()
          }
        } catch (removeError) {
          // Ignore remove errors
        }
        throw error
      }
    }

    const updatedUsage = await getRemainingUses()
    figma.notify(`Created ${variants.length} variant(s)`)
    emit('BATCH_RESIZE_SUCCESS', {
      variants: resizedVariants,
      remaining: updatedUsage.remaining
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    figma.notify(`Error: ${errorMessage}`)
    emit('RESIZE_ERROR', { message: errorMessage })
  }
})

/**
 * Get usage info on demand
 */
on('GET_USAGE_INFO', async () => {
  try {
    const usageInfo = await getRemainingUses()
    emit('USAGE_INFO', usageInfo)
  } catch (error) {
    console.error('Error getting usage info:', error)
    emit('USAGE_INFO', { plan: 'free', remaining: 0, limit: FREE_ONE_TIME_LIMIT })
  }
})

/**
 * Get all available tiers from Stripe
 * Called by UI to dynamically display all pricing tiers
 */
on('GET_ALL_TIERS', async () => {
  try {
    const { getAllTiers } = await import('./stripe-products')
    const allTiers = await getAllTiers()
    console.log(`[Main] Got ${allTiers.length} tiers to display`)

    // Emit each tier so UI can render them dynamically
    allTiers.forEach(tierData => {
      emit('TIER_INFO', {
        plan: tierData.tier,
        ...tierData
      })
    })
  } catch (error) {
    console.error('[Main] Error getting all tiers:', error)
    // Don't emit anything - only display products retrieved from Stripe
    // UI will not show tiers if TIER_INFO is not emitted
  }
})
