# I Tried to Break Barron's Bound

<div class="post-meta">14 July 2026 </div>

> *Note: This project is currently being expanded into a formal technical report, including a high-dimension sweep up to $d=100$ and structural scaling analysis. I'll update it to this post once it's finalized.*

A week ago I [published](/blog/barron-constant) a result I was genuinely excited about: Barron's 1993 theorem guaranteeing a single-hidden-layer network of width $n$ approximates any function of bounded Fourier norm $C_f$ to within a computable ceiling held on a GPU, with the realized error at roughly 60% of that ceiling and a textbook $-0.50$ convergence slope.

$$
\left\lVert f - f_n \right\rVert_{L^2} \;\le\; \frac{2\,C_f\,r}{\sqrt{n}}
$$

That result came from a deliberately narrow setup: two smooth targets, one near-perfect optimizer. So I widened it - seven target families, five activations, three optimizers, dimensions up to 20 (with a d=100 sweep currently in progress for the full report) and tried to make it fail. The honest headline: **the bound was never once violated for an in-class target, but the clean "60%, slope $-0.50$" picture dissolved.** In the broad sweep the network doesn't ride the ceiling; it drops far below it and flattens out. The bound holds, but it turns out to be *loose*, not tight. Here is what that looks like.

## What the theorem actually promises and what it doesn't

The total error a trained network makes decomposes into three pieces, and Barron bounds only the first:

$$
\underbrace{\lVert f - \hat f_n \rVert}_{\text{total}} \;\le\; \underbrace{\lVert f - f_n^\star \rVert}_{\text{approximation (Barron)}} \;+\; \underbrace{\lVert f_n^\star - \hat f_n \rVert}_{\text{optimization}} \;+\; \underbrace{\text{estimation}}_{\text{finite sample}}
$$

When I hold dimension and width fixed and sweep the training-set size, the picture is stark: train and test error both sit far below the ceiling, and the gap between them - the estimation error decays as $O(1/\sqrt{N})$, entirely independently of Barron's bound. The approximation term the theorem controls is only a small slice of what's going on.

![Error decomposition: train and test error vs Barron ceiling, and estimation gap decay](/assets/images/blog/barron-extension/fig4_error_decomposition.png)

<figcaption><b>Figure 1 — Error decomposition ($d=5$, $n=256$, Gaussian).</b> Left: train and test error both sit near zero, far under the Barron ceiling $2C_f/\sqrt{n}=0.4987$ -the optimizer never needs anywhere near the full approximation budget. Right: the test−train (estimation) gap decays as $O(1/\sqrt{N})$, a term Barron's theorem says nothing about. The bound governs one slice; the other two terms are yours to manage.</figcaption>

## Does it care what activation you use? (No - and all of them stay far below the ceiling.)

Barron's proof assumes a sigmoidal activation, but the modern world runs on ReLU, GELU, and Swish. I reran the width sweep with all five. Every one stayed comfortably under the bound, and this is where the looseness first shows: the realized constant $c = \text{error}\cdot\sqrt{n}/C_f$ never approaches the ceiling of $c=1$. It sits between roughly $0.005$ and $0.1$, an order of magnitude or more below.

![Log-log convergence for five activations and effective constant c per activation](/assets/images/blog/barron-extension/fig5_activation_universality.png)

<figcaption><b>Figure 2 — Activation universality (Track B, $d=5$, Gaussian).</b> Left: log–log convergence for sigmoid, tanh, ReLU, GELU, Swish, all well beneath the Barron bound. Right: the effective constant $c$ per activation — every bar far below the $c=1$ ceiling (sigmoid and tanh lowest, near $0.01$; ReLU highest, still only ~$0.1$). The theorem doesn't need its original sigmoid — but nor does any activation come close to saturating it.</figcaption>

> This is the first honest crack in the "60%" story: with these targets and enough width, the net beats the bound by a wide, activation-dependent margin. There is no universal tightness constant - only a range, well below the ceiling.

## Does it care about your optimizer? (Yes, this is the only thing that actually breaks it.)

This is the most useful result in the whole project. I ran the same problem with L-BFGS, Adam, and SGD. L-BFGS was lowest and rock-stable. Adam tracked it down. SGD followed along - and then, at width 1024, it detonated, shooting an order of magnitude above the others and up toward the ceiling. Not because the theorem is wrong, but because **the bound describes a network that *exists*, not the one your optimizer *finds*.** SGD fell into a bad basin, and the approximation bound has nothing to say about that.

![L-BFGS vs Adam vs SGD width sweep showing SGD divergence at n=1024](/assets/images/blog/barron-extension/fig6_optimizer_robustness.png)

<figcaption><b>Figure 3 — Optimizer robustness (Track C, $d=5$, Gaussian).</b> L-BFGS (green) sits lowest and stable across all widths; Adam (orange) tracks it closely; SGD (navy) follows until $n=1024$, where it diverges sharply upward toward the bound. The bound is existential, not algorithmic - the only "break" in the entire study comes from the optimizer, not the theorem.</figcaption>

**The one practical lesson.** It's easy to read Barron as a promise about what training will get you. It isn't, it guarantees a good network exists, not that your optimizer finds it. That SGD spike is the gap made visible.

## The rate, across seven targets

Here is where the claim of the $-0.50$ slope comes apart. In the narrow pilot, the net rode the $1/\sqrt{n}$ curve because it was working near its capacity. In the broad sweep, the net hits a low error floor almost immediately and then flattens, so the fitted slopes come out shallow and scattered: $-0.03$ for Gaussian, $-0.246$ for sech, $-0.189$ for the Laplacian (which is out-of-class by construction - its Barron norm diverges, so I include it only as a control) , and even slightly positive for ridge and high-frequency Gaussian. The clean $-0.50$ is nowhere to be seen.

![Neural error vs Barron bound across six target families with fitted slopes per panel](/assets/images/blog/barron-extension/fig1_convergence_rate.png)

<figcaption><b>Figure 4 — Convergence rate by target ($d=5$).</b> Across all six in-class families the neural error (solid) stays one to two orders of magnitude <em>below</em> the Barron bound (dashed) at every width — the bound is universally satisfied but loose. The fitted slopes (shown per panel) range from $-0.03$ to $-0.25$, far from the theoretical $-0.50$: with this much width the net floors out long before the asymptotic rate can express itself. The bound is a ceiling the net comfortably ducks under, not a curve it tracks.</figcaption>

This is the honest correction to the first post. The $-0.50$ slope and the 60% figure were real - *in the regime where the network was capacity-limited*. Give it more width than the target demands and it simply solves the problem, sits far under the ceiling, and the asymptotic rate stops being visible. Neither picture is wrong; they describe different regimes.

## Why anyone cares: dimension

The reason Barron's bound matters is dimension - its constant grows only linearly in $d$, so a network shouldn't suffer the exponential blow-up that classical methods do. Sweeping dimension at fixed width, the neural error grows slowly and gracefully. A random-Fourier-feature baseline, by contrast, explodes as $d$ climbs.

![L2 error vs input dimension for neural net, RFF baseline, and polynomial baseline](/assets/images/blog/barron-extension/fig2_dimension_independence.png)

<figcaption><b>Figure 5 — Error vs. input dimension ($n=256$).</b> Neural nets on Gaussian and sech targets grow slowly and smoothly with $d$. The random-Fourier-feature baseline (orange) blows up at high dimension. The degree-2 polynomial (red) behaves idiosyncratically here — a reminder that "curse of dimensionality" depends heavily on the target and the baseline, and shouldn't be oversold from a single sweep.</figcaption>

## So did it survive?

Yes, and more decisively than the pilot suggested: across seven targets, five activations, and every optimizer that converged, the bound was never violated for an in-class function. But "survived" and "tight" are different claims. The broad sweep shows the bound is *loose* - the trained network typically beats it by one to two orders of magnitude, the realized constant is a range well below the ceiling rather than a clean 60%, and the $-0.50$ slope only appears when the network is capacity-limited. The single genuine failure came not from the theorem but from SGD, which is exactly the distinction the theorem is careful to make: it bounds the best network that exists, not the one your optimizer stumbles into.

So unlike the first post, this one doesn't hand you a quotable number, and I want to be upfront about that. The 60% belonged to a narrow, controlled regime. The broader, more honest finding is this: Barron's bound is a reliable ceiling but a conservative one - in practice you need far fewer neurons than it suggests, which is genuinely useful to know, even if it doesn't fit in a headline.

## Resources

* **Repo:** [github.com/Sid-WC121/barron-extension](https://github.com/Sid-WC121/barron-extension)
* **Technical Report:** *(In progress - follow for updates)*
* **Part1:** [Measuring Barron&#39;s Constant: Putting a 1993 Approximation Theorem on a GPU](/blog/barron-constant) - the first post in this series. Narrow setup, two targets, one optimizer; establishes the 60% figure and the $-0.50$ slope that this post stress-tests.

## References

:::bibtex
@ARTICLE{256500,
  author={Barron, A.R.},
  journal={IEEE Transactions on Information Theory},
  title={Universal approximation bounds for superpositions of a sigmoidal function},
  year={1993},
  volume={39},
  number={3},
  pages={930-945},
  keywords={Artificial neural networks;Fourier transforms;Approximation error;Feeds;Linear approximation;Neural networks;Feedforward neural networks;Information theory;Statistics;Statistical distributions},
  doi={10.1109/18.256500}}
:::
